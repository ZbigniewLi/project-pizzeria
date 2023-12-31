  import { settings, select, classNames, templates } from "./settings.js";
  import Product from "./components/Product.js";
  import Cart from "./components/Cart.js";
import Booking from "./components/Booking.js";

  const app = {

    initBooking: function(){
      const thisApp = this;

      thisApp.booking = document.querySelector(select.containerOf.booking);
      new Booking(thisApp.booking);
    },

    initPages: function(){
      const thisApp = this;

      thisApp.pages = document.querySelector(select.containerOf.pages).children;
      thisApp.navLinks = document.querySelectorAll(select.nav.links);

      const idFromHash = window.location.hash.replace('#/', '');

      let pageMatchingHash = thisApp.pages[0].id;

      for(let page of thisApp.pages){
        if(page.id == idFromHash){
          pageMatchingHash = page.id;
          break;
        }
      }

      //console.log ('pageMatchingHash' , idFromHash)
      thisApp.activatePage(pageMatchingHash);

      for(let link of this.navLinks){
        link.addEventListener('click', function(event){
          const clickedElement = this;
          event.preventDefault();
          //get page id from href attribute
          const id = clickedElement.getAttribute('href').replace('#', '');
          //run thisApp.activePage with that id
          thisApp.activatePage(id);
          //change url hash
          window.location.hash = '#/' + id;
        })
      }
    },

    activatePage: function(pageId){
      const thisApp = this;
      /* add class active to matching pages, remove from non-matching*/
      for(let page of thisApp.pages){
        /*if(page.id == pageId){
          page.classList.add(classNames.pages.active);
        } else {
          page.classList.remove(classList.pages.active);
        }*/
        page.classList.toggle(classNames.pages.active, page.id == pageId);
      }
      /* add class active to matching links, remove from non-matching*/
      for(let link of thisApp.navLinks){
        link.classList.toggle(
          classNames.nav.active,
           link.getAttribute('href') =='#' + pageId);
      }
    },
    initMenu: function(){
  const thisApp = this;
  console.log('thisApp.data:', thisApp.data);

  for(let productData in thisApp.data.products){
    new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
  }
    },

    initCart: function(){
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart (cartElem);

      thisApp.productList = document.querySelector(select.containerOf.menu);
      thisApp.productList.addEventListener('add-to-cart', function(event){
        app.cart.add(event.detail.product);
      });
    },

    initData: function(){
      const thisApp = this;
      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.products;

      fetch(url)
      .then(function(rawresponse){
        return rawresponse.json();
      })
      .then(function(parsedresponse){
        console.log('parsedresponse', parsedresponse);
        //save parsed response as thisapp.data.products
        thisApp.data.products = parsedresponse;
        //execute initmenu method
        thisApp.initMenu();
      });
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
    thisApp.initData();
    // thisApp.initMenu();
    thisApp.initCart();
    thisApp.initPages();
    this.initBooking();
    },
  };

app.init()
