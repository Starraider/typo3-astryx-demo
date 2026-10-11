import {AccordionController} from './Controllers/AccordionController.js';
import {CarouselController} from './Controllers/CarouselController.js';
import {MobileNavController} from './Controllers/MobileNavController.js';
import {ThemeController} from './Controllers/ThemeController.js';
import {DropdownController} from './Controllers/DropdownController.js';
import {ClassicGalleryController} from './Controllers/ClassicGalleryController.js';
import {CodeBlockController} from './Controllers/CodeBlockController.js';
import {TreeListController} from './Controllers/TreeListController.js';
import {SingleColumnController} from './Controllers/SingleColumnController.js';
function initialize() {
  for (const root of document.querySelectorAll('[data-astryx-code-block]')) new CodeBlockController(root);
  for (const [selector, Controller] of [['[data-astryx-single-column]', SingleColumnController], ['[data-astryx-tree-list]', TreeListController], ['[data-astryx-accordion]', AccordionController], ['[data-astryx-carousel]', CarouselController], ['[data-astryx-classic-gallery]', ClassicGalleryController], ['[data-astryx-mobile-nav]', MobileNavController], ['[data-astryx-dropdowns]', DropdownController], ['.astryx-root', ThemeController]]) {
    for (const root of document.querySelectorAll(selector)) {
      try { new Controller(root); } catch (error) { console.error('Astryx controller initialization failed', error); }
    }
  }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, {once:true}); else initialize();
