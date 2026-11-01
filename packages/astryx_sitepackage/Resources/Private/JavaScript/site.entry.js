import * as stylex from '@stylexjs/stylex';
import { styles } from './StyleX/components/site-shell.stylex.js';
import '../CSS/main.css';

const logoImageClasses = stylex.props(styles.logo_image).className?.split(/\s+/).filter(Boolean) ?? [];
document.querySelectorAll('.astryx-logo img').forEach(image => image.classList.add(...logoImageClasses));
