<?php
declare(strict_types=1);
namespace Skom\Typo3Astryx\Command;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use TYPO3\CMS\Core\Authentication\CommandLineUserAuthentication;
use TYPO3\CMS\Core\Core\Bootstrap;
use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\DataHandling\DataHandler;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Utility\GeneralUtility;
/** Converts only inventoried, lossless mappings. Default execution is a dry run. */
final class MigrateCommand extends Command
{
    private const MAP = ['header'=>'astryx_heading','text'=>'astryx_text','textmedia'=>'astryx_textmedia',
        'textpic'=>'astryx_textmedia','image'=>'astryx_textmedia','div'=>'astryx_divider','uploads'=>'astryx_downloads'];
    private const RETAINED = ['menu_sitemap','menu_subpages','menu_pages','shortcut','html'];
    public function __construct(private readonly ConnectionPool $connections) { parent::__construct(); }
    protected function configure(): void
    {
        $this->setDescription('Audit FSC records and convert supported mappings through TYPO3 DataHandler')
            ->addOption('apply', null, InputOption::VALUE_NONE, 'Apply after an FSC-free fixture rehearsal')
            ->addOption('report', null, InputOption::VALUE_REQUIRED, 'Private absolute JSON report path, required for apply');
    }
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $records = $this->connections->getConnectionForTable('tt_content')->executeQuery('SELECT * FROM tt_content')->fetchAllAssociative();
        $report = ['mode'=>$input->getOption('apply') ? 'apply' : 'dry-run', 'changes'=>[], 'manualReview'=>[], 'retained'=>[], 'before'=>[]];
        $data = [];
        foreach ($records as $row) {
            $type = $row['CType'];
            if (str_starts_with($type, 'astryx_') || isset($GLOBALS['TCA']['tt_content']['types'][$type]['showitem']) && !isset(self::MAP[$type]) && !in_array($type, self::RETAINED, true) && !in_array($type, ['bullets','table','list'], true)) {
                continue;
            }
            if (in_array($type, self::RETAINED, true)) { $report['retained'][] = ['uid'=>$row['uid'],'CType'=>$type]; continue; }
            if (!isset(self::MAP[$type]) || (int)$row['t3ver_wsid'] !== 0 || (int)$row['deleted'] !== 0) {
                $report['manualReview'][] = ['uid'=>$row['uid'],'CType'=>$type,'reason'=>'Structured conversion or draft/deleted record requires explicit review']; continue;
            }
            $data['tt_content'][$row['uid']] = ['CType'=>self::MAP[$type]];
            $report['changes'][] = ['table'=>'tt_content','uid'=>$row['uid'],'from'=>$type,'to'=>self::MAP[$type]];
            $report['before']['tt_content'][$row['uid']] = ['CType'=>$type];
        }
        foreach ($this->connections->getConnectionForTable('pages')->executeQuery('SELECT uid,backend_layout,backend_layout_next_level FROM pages WHERE deleted=0 AND t3ver_wsid=0')->fetchAllAssociative() as $page) {
            foreach (['backend_layout','backend_layout_next_level'] as $field) {
                if ($page[$field] === 'pagets__subpage') {
                    $data['pages'][$page['uid']][$field] = 'pagets__default';
                    $report['before']['pages'][$page['uid']][$field] = $page[$field];
                    $report['changes'][] = ['table'=>'pages','uid'=>$page['uid'],'field'=>$field,'from'=>$page[$field],'to'=>'pagets__default'];
                }
            }
        }
        $reportPath = $input->getOption('report');
        if ($input->getOption('apply')) {
            if ($report['manualReview'] !== []) { $output->writeln('Manual review records prevent migration. No records changed.'); $output->writeln(json_encode($report, JSON_PRETTY_PRINT)); return self::FAILURE; }
            if (!is_string($reportPath) || !str_starts_with($reportPath, '/') || !is_dir(dirname($reportPath)) || file_exists($reportPath)) {
                $output->writeln('Apply requires a new absolute --report file in an existing private directory.'); return self::INVALID;
            }
            $publicPath = realpath(Environment::getPublicPath());
            if ($publicPath !== false && str_starts_with(realpath(dirname($reportPath)) . '/', $publicPath . '/')) {
                $output->writeln('Reports must be outside the web root.'); return self::INVALID;
            }
            // Persist before state before changing any record. Full rollback uses the rehearsed database/FAL backup.
            file_put_contents($reportPath, json_encode($report, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR) . "\n", LOCK_EX);
            chmod($reportPath, 0600);
            Bootstrap::initializeBackendUser(CommandLineUserAuthentication::class);
            Bootstrap::initializeBackendAuthentication();
            $handler = GeneralUtility::makeInstance(DataHandler::class);
            $handler->start($data, []);
            $handler->process_datamap();
            $report['errors'] = $handler->errorLog;
            $report['status'] = $handler->errorLog === [] ? 'applied' : 'failed';
            file_put_contents($reportPath, json_encode($report, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR) . "\n", LOCK_EX);
            if ($handler->errorLog !== []) { $output->writeln(json_encode($handler->errorLog)); return self::FAILURE; }
        } elseif ($reportPath) {
            if (file_exists($reportPath)) { $output->writeln('Report already exists; refusing to overwrite.'); return self::INVALID; }
            file_put_contents($reportPath, json_encode($report, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR) . "\n", LOCK_EX);
            chmod($reportPath, 0600);
        }
        $output->writeln(json_encode($report, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR));
        return $report['manualReview'] === [] ? self::SUCCESS : self::FAILURE;
    }
}
