import { settings } from "./settings";
import Product from "./components/product";
import Cart from "./components/Cart";
import AmountWidget from "./components/AmountWidget";
import CartProduct from "./components/CartProduct";

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
  export default AmountWidget;