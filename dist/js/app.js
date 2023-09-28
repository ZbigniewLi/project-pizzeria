  import { settings } from "./settings";
  import Product from "./components/product";
  import Cart from "./components/Cart";
  import AmountWidget from "./components/AmountWidget";
  import CartProduct from "./components/CartProduct";
  const app = {
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
        app.cart.add(event.detail.Product);
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
    },
  };
  
 
app.init()
