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
      thisWidget.dom.wrapper.dispatchEvent(new Event('updated'))
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
    initActions(){
      const thisCart = this;
    
       thisCart.dom.toggleTrigger.addEventListener('click', function (){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
       });
       

    }
    getElements(element){
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    }

    add(menuProduct){
      //const thisCart = this;
      //thisCart.products.push(menuProduct);
      console.log(menuProduct);
    }
  }
 /*const CartProduct = {

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
  initActions: function(){
  cartButton.thisCartProduct.dom.edit.addEventListener('click');
  cartButton.thisCartProduct.dom.remove.addEventListener('click');
  }
 }*/

  const app = {
    initMenu: function(){
  const thisApp = this;
  console.log('thisApp.data:', thisApp.data);

  for(let productData in thisApp.data.products){
    new Product(productData, thisApp.data.products[productData]);
  }
    },

    initCart: function(){
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart (cartElem);
    },

    initData: function(){
      const thisApp = this;
    
      thisApp.data = dataSource;
    },
    
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
    
    thisApp.initData();
    thisApp.initMenu();
    thisApp.initCart();
    },
  };
app.init()
}