#!/usr/bin/env python3
"""Assemble a reproducible Composer archive; never include runtime or fixture data."""
from pathlib import Path
import hashlib,json,sys,zipfile
extension=Path(__file__).resolve().parent.parent
version=json.loads((extension/'package.json').read_text())['version']
output=Path(sys.argv[1] if len(sys.argv)>1 else 'var/releases').resolve()
output.mkdir(parents=True,exist_ok=True)
ext_key=json.loads((extension/'composer.json').read_text()).get('extra',{}).get('typo3/cms',{}).get('extension-key','typo3_astryx')
archive=output/f'{ext_key}_{version}.zip'
manifest=json.loads((extension/'Resources/Public/StylexManifest/stylex-manifest.json').read_text())
recipes=json.loads((extension/'Build/recipes.json').read_text())
css=(extension/'Resources/Public/Assets/astryx.css').read_text()
for name,dimensions in recipes.items():
    keys=[f'Astryx{name}.root']
    keys.extend(f'Astryx{name}.{dimension}_{value.replace("-","_")}'
                for dimension,values in dimensions.items() for value in values)
    for key in keys:
        entry=manifest['styles'].get(key)
        if not entry or any('.'+classname not in css for classname in entry['className'].split()):
            raise RuntimeError('Incomplete packaged recipe: '+key)
if len(manifest['artifacts'])!=5:
    raise RuntimeError('Expected all five paired CSS artifacts before packaging')
for artifact in manifest['artifacts']:
    path=(extension/'Resources/Public/StylexManifest'/artifact['path']).resolve()
    if not path.is_relative_to(extension/'Resources/Public') or hashlib.sha256(path.read_bytes()).hexdigest()!=artifact['sha256']:
        raise RuntimeError('Invalid packaged artifact: '+artifact['path'])
with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as result:
    directories=set()
    for source in sorted(extension.rglob('*')):
        if not source.is_file():continue
        relative=source.relative_to(extension)
        if any(part in {'Tests','vendor','node_modules','.git','.github','.DS_Store','__pycache__'} for part in relative.parts):continue
        for parent in relative.parents:
            if parent.as_posix()!='.':directories.add(parent.as_posix()+'/')
    for directory in sorted(directories):
        entry=zipfile.ZipInfo(directory,(2026,10,5,0,0,0));entry.external_attr=0o40755<<16;result.writestr(entry,b'')
    for source in sorted(extension.rglob('*')):
        if not source.is_file():continue
        relative=source.relative_to(extension)
        if any(part in {'Tests','vendor','node_modules','.git','.github','.DS_Store','__pycache__'} for part in relative.parts):continue
        if relative.suffix in {'.zip','.gz','.log','.sql'} and relative.name!='ext_tables.sql':continue
        content=source.read_bytes()
        if relative.as_posix()=='composer.json':
            package=json.loads(content);package['version']=version
            content=(json.dumps(package,indent=2)+'\n').encode()
        entry=zipfile.ZipInfo(relative.as_posix(),(2026,10,5,0,0,0))
        entry.compress_type=zipfile.ZIP_DEFLATED;entry.external_attr=0o100644<<16
        result.writestr(entry,content)
checksum=hashlib.sha256(archive.read_bytes()).hexdigest()
(archive.with_suffix('.zip.sha256')).write_text(checksum+'  '+archive.name+'\n')
legacy_archive=output/f'typo3-astryx-{version}.zip'
legacy_archive.write_bytes(archive.read_bytes())
(legacy_archive.with_suffix('.zip.sha256')).write_text(checksum+'  '+legacy_archive.name+'\n')
print(json.dumps({'archive':str(archive),'version':version,'sha256':checksum,'bytes':archive.stat().st_size},indent=2))
