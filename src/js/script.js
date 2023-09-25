/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };
  
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };
  
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
  };
  
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

  class Product {
    constructor(id, data){
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.initAccordion();
      thisProduct.getElements();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      
    
      console.log('new Product:', thisProduct);
    }

    addToCart() {
      const thisProduct = this;

      app.cart.add(thisProduct.prepareCartProduct());
    }

    prepareCartProduct(){

      const thisProduct = this;
      const productSummary = {
        id: thisProduct.id, // Dodaj właściwość id i przypisz wartość z thisProduct.id
        name: thisProduct.data.name, // Dodaj właściwość name i przypisz wartość z thisProduct.name
        amount: thisProduct.amount, // Dodaj właściwość amount i przypisz wartość z thisProduct.amount
        params: thisProduct.prepareCartProductParams(),
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.priceSingle* thisProduct.amount,
      };
      return productSummary;

    }

    prepareCartProductParams() {
      const thisProduct = this;
    
      const formData = utils.serializeFormToObject(thisProduct.form);
      const params = {};
    
      // for very category (param)
      for(let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
    
        // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
        params[paramId] = {
          label: param.label,
          options: {}
        }
    
        // for every option in this category
        for(let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
    
          if(optionSelected) {
            // option is selected!
            params[paramId].options[optionId]=option.label;
          }
        }
      }
    
      return params;
    }

   

    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.amount = thisProduct.amountWidget.value;
        thisProduct.processOrder();
      });
    }

    renderInMenu(){
      const thisProduct = this;

      //generate htmlbased on template
      const generateHTML = templates.menuProduct(thisProduct.data)
      //create element using utils.createElemntsFromHtml
      thisProduct.element = utils.createDOMFromHTML(generateHTML);
      //find menu container
      const menuContainer = document.querySelector(select.containerOf.menu);
      //add element to menu
      menuContainer.appendChild(thisProduct.element);
    }

    getElements(){
      const thisProduct = this;

      //thisProduct.accordionTrigger.addEventListener('click', function(event) {
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion(){
      const thisProduct = this;
  
      /* find the clickable trigger (the element that should react to clicking) */
      const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      /* START: add event listener to clickable trigger on event click */
      clickableTrigger.addEventListener('click', function(event) {
        /* prevent default action for event */
        event.preventDefault();
        /* find active product (product that has active class) */
        const product = document.querySelector('.product.active');
        /* if there is active product and it's not thisProduct.element, remove class active from it */
         if (product && product != thisProduct.element){
          product.classList.remove('active')}
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle('active');
      });
    }

    initOrderForm(){
    const thisProduct = this;
    console.log(thisProduct)
    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });
    
    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }
    
    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }
    
    processOrder(){
      const thisProduct = this;
      console.log(thisProduct)

      const formData = utils.serializeFormToObject(this.form);
      console.log('formData',formData);
      
      // set price to default price
        let price = thisProduct.data.price;
          for(let paramId in thisProduct.data.params){
            const param = thisProduct.data.params[paramId]
     // for every option in this category
      for(let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        console.log(optionId, option);
        // check if there is param with a name of paramId in formData and if it includes optionId
        const image = thisProduct.element.querySelector('.' + paramId + '-' + optionId)
        if(formData[paramId] && formData[paramId].includes(optionId)) {
          if (image) image.classList.add('active');
          // check if the option is not default
          if (!option.default) {
            // add option price to price variable
            price += option.price;
          }
        }else {
          if (image) image.classList.remove('active');
          // check if the option is default
           if (option.default) {
            // reduce price variable
            price -= option.price;
          }
        }
      }
      }
      //mulitply price by amount
      thisProduct.priceSingle = price
      price *= thisProduct.amountWidget.value; console.log(price, this.amountWidget)
      thisProduct.priceElem.innerHTML = price
    }
  }

  class AmountWidget {
    constructor(element){
      const thisWidget = this;
      console.log('AmountWidget:' , thisWidget);
      console.log('constructor arguments:' , element);
      thisWidget.getElements(element);
      thisWidget.initActions();
      thisWidget.setValue(thisWidget.dom.input.value||settings.amountWidget.defaultValue)
      
    }

    getElements(element){
      const thisWidget = this;
      thisWidget.dom = {};
      thisWidget.dom.wrapper = element;
      thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
      thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
      thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
      console.log(thisWidget);

    }

    initActions(){
      const thisWidget = this;
      thisWidget.dom.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.dom.input.value);
      });
      thisWidget.dom.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value +1)
      })
      thisWidget.dom.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value -1)
      })
    }

    announce(){
      const thisWidget = this;
      thisWidget.dom.wrapper.dispatchEvent(new Event('updated'));
      const event = new CustomEvent ('updated', {bubbles: true});
    }
    
    setValue(value){
      const thisWidget = this;

      const newValue = parseInt(value)
      const minValue = settings.amountWidget.defaultMin;
      const maxValue = settings.amountWidget.defaultMax;
      
    /* TODO: Add validation */
    if(thisWidget.value !== newValue && !isNaN(newValue)) {
    thisWidget.value = newValue;
    
  } if (newValue < minValue) {
    thisWidget.value = minValue;
  } if (newValue > maxValue) {
    thisWidget.value = maxValue;
  }
  thisWidget.dom.input.value = thisWidget.value;
  thisWidget.announce();
}
  }  

  class Cart {
    constructor(element){
      const thisCart = this;
      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();
      console.log ('new Cart', thisCart);
    }

    sendOrder(){
      const thisCart = this;
      const url = settings.db.url + '/' + settings.db.orders;
      const payload = {
          address: thisCart.dom.address.value,
          phone: thisCart.dom.phone.value,
          totalPrice: thisCart.totalPrice,
          subtotalPrice: thisCart.subtotalPrice,
          totalNumber: thisCart.totalNumber,
          deliveryFee: thisCart.deliveryFee,
          products: []
        }
        for(let prod of thisCart.products) {
          payload.products.push(prod.getData());
        }
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        };
        
        fetch(url, options);
    }

    update(){
      const thisCart = this;
      const deliveryFee = settings.cart.defaultDeliveryFee;

      let totalNumber = 0;
      let subtotalPrice = 0;
      for (const product of thisCart.products) {
        totalNumber += product.amount; // Dodaj liczbę sztuk produktu do totalNumber
        subtotalPrice += product.price; // Dodaj cenę całkowitą produktu do subtotalPrice
      }
      thisCart.totalPrice = subtotalPrice + deliveryFee;
      if (totalNumber > 0) {
        thisCart.totalPrice = subtotalPrice + deliveryFee;
      } else {
        thisCart.totalPrice = 0; // Jeśli koszyk jest pusty, cena końcowa wynosi zero
      }
      thisCart.dom.totalNumber.innerHTML = totalNumber; // <--- Zmieniona linia
      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice; // <--- Zmieniona linia
      for ( const elem of thisCart.dom.totalPrice){
        elem.innerHTML = thisCart.totalPrice;
      }
      thisCart.dom.deliveryFee.innerHTML = deliveryFee; // <--- Zmieniona linia
      thisCart.totalNumber = totalNumber;
      thisCart.subtotalPrice = subtotalPrice;
      thisCart.deliveryFee = deliveryFee;
    }

    initActions(){
      const thisCart = this;
    
       thisCart.dom.toggleTrigger.addEventListener('click', function (){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
       });
       console.log('thisCart.ProductList', thisCart.dom.productList)
       thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
        console.log ('test');
       });
        thisCart.dom.productList.addEventListener('remove', function(){
          thisCart.remove(event.detail.cartProduct);
        });
        thisCart.dom.form.addEventListener('submit', function(event){
          event.preventDefault();
          thisCart.sendOrder();
        })
       
    }

    remove(cartProduct){
      const thisCart = this;
      const productIndex = thisCart.products.indexOf(cartProduct);
      
    // Jeśli produkt został znaleziony w thisCart.products
      if (productIndex !== -1) {
      // Usuń produkt z tablicy thisCart.products
      thisCart.products.splice(productIndex, 1);

      // Usuń reprezentację produktu z HTML-a
      cartProduct.dom.wrapper.remove();

      // Wywołaj metodę update w celu przeliczenia sum po usunięciu produktu
      thisCart.update();
      }
    }

    getElements(element){
      const thisCart = this;
      thisCart.dom = [];
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);

    }

    add(menuProduct){
      const thisCart = this;
      console.log(menuProduct);
          // Generate HTML for the cart product
    const generatedHTML = templates.cartProduct(menuProduct);

    // Create a DOM element from the generated HTML
    const cartProductDOM = utils.createDOMFromHTML(generatedHTML);


    // Add the cart product to the cart's product list
    thisCart.dom.productList.appendChild(cartProductDOM);
    
    thisCart.products.push(new CartProduct(menuProduct, cartProductDOM));
    console.log('thisCart.products', thisCart.products)
    thisCart.update(); // Wywołaj metodę update po dodaniu produktu
    }
    

  }

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
  
  class CartProduct{
    constructor(menuProduct, element){
     const thisCartProduct = this;

     thisCartProduct.id = menuProduct.id
     thisCartProduct.amount = menuProduct.amount;
     thisCartProduct.price = menuProduct.price;
     thisCartProduct.priceSingle = menuProduct.priceSingle;
     thisCartProduct.name = menuProduct.name;
     thisCartProduct.params = menuProduct.params;
      
     thisCartProduct.getElements(element);
     thisCartProduct.initAmountWidget();
     thisCartProduct.initActions();
    }
  
    getData() {
      const thisCartProduct = this;
  
      return {
        id: thisCartProduct.id,
        amount: thisCartProduct.amount,
        price: thisCartProduct.price,
        priceSingle: thisCartProduct.priceSingle,
        name: thisCartProduct.name,
        params: thisCartProduct.params,
      };
    }

  
  getElements(element){
   const thisCartProduct = this;
   thisCartProduct.dom = {wrapper:element};
    thisCartProduct.dom.amountWidget = element.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);
  }

  initAmountWidget(){
    const thisCartProduct = this;

    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
    thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      thisCartProduct.price = thisCartProduct.priceSingle*thisCartProduct.amount;
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      thisCartProduct.dom.wrapper.dispatchEvent(new CustomEvent('updated', {bubbles: true}));
    });
  }

  remove(){
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct : thisCartProduct,
      },
    });
    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }
  initActions(){
  
    const thisCartProduct = this;

  thisCartProduct.dom.edit.addEventListener('click', function (event){
    event.preventDefault();
  });

  thisCartProduct.dom.remove.addEventListener('click', function(event){
    event.preventDefault();
    thisCartProduct.remove();
  });
  }
}
app.init()
}