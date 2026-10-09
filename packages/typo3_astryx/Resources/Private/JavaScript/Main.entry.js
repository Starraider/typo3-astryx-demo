import '../CSS/main.css';
import './Stylex/AstryxButton.stylex.js';
import './Stylex/AstryxBadge.stylex.js';
import './Stylex/AstryxStatusDot.stylex.js';
import './Stylex/AstryxHeading.stylex.js';
import './Stylex/AstryxText.stylex.js';
import './Stylex/AstryxDivider.stylex.js';
import './Stylex/AstryxCard.stylex.js';
import './Stylex/AstryxGrid.stylex.js';
import './Stylex/AstryxNotice.stylex.js';
import './Stylex/AstryxIcon.stylex.js';
import './Stylex/Themes/Neutral.stylex.js';
import './Stylex/Themes/Stone.stylex.js';
import './Stylex/Themes/Ocean.stylex.js';
import './main.js';
if (import.meta.env.DEV) {
 const id='__stylex_dev_css__'; let link=document.getElementById(id);
 if(!link){link=document.createElement('link');link.id=id;link.rel='stylesheet';document.head.append(link);}
 const url=new URL(/* @vite-ignore */ '/virtual:stylex.css',import.meta.url).href;link.href=url;
 const refresh=()=>{link.href=url+'?t='+Date.now();};
 import.meta.hot?.on('stylex:css-update',refresh);import.meta.hot?.on('vite:afterUpdate',refresh);
}
