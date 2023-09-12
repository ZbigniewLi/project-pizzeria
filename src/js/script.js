/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

const select = {
  templateOf: {
    menuProduct: "#template-menu-product",
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
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
      thisProduct.processOrder();
    
      console.log('new Product:', thisProduct);
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
    }

    initAccordion(){
      const thisProduct = this;
  
      /* find the clickable trigger (the element that should react to clicking) */
      const clickableTrigger =thisProduct.element.querySelector(select.menuProduct.clickable);
      /* START: add event listener to clickable trigger on event click */
      clickableTrigger.addEventListener('click', function(event) {
        /* prevent default action for event */
        event.preventDefault();
        /* find active product (product that has active class) */
        const product = document.querySelector('.product.active');
        /* if there is active product and it's not thisProduct.element, remove class active from it */
         if (product && product != thisProduct.element){
          product.classList.remove('active')};
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
      thisProduct.priceElem.innerHTML = price
    }
  }

    

  

  const app = {
    initMenu: function(){
  const thisApp = this;
  console.log('thisApp.data:', thisApp.data);

  for(let productData in thisApp.data.products){
    new Product(productData, thisApp.data.products[productData]);
  }

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
    },
  };
app.init()
}