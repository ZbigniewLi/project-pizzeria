import { settings } from "./settings";
import Cart from "./components/Cart";
import AmountWidget from "./components/AmountWidget";
import CartProduct from "./components/CartProduct";

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
   
      //  app.cart.add(thisProduct.prepareCartProduct());
      const event = new CustomEvent('add-to-cart', {
        bubbles: true,
        detail: {
          product: thisProduct.prepareCartProduct(),
        },
      }
      );
      thisProduct.element.dispatchEvent(event);
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

  export default Product;