//import { settings } from "../settings.js";
class BaseWidget{
    constructor(wrapperElement, initialValue){
        const thisWidget = this;
        thisWidget.dom = {};
        thisWidget.dom.wrapper = wrapperElement;

        thisWidget.correctValue = initialValue;
    }

    set value (value){
        const thisWidget = this;
      console.log('ghdjs', value);
        const newValue = thisWidget.parseValue(value)
        //const minValue = settings.amountWidget.defaultMin;
        //const maxValue = settings.amountWidget.defaultMax;
        console.log(newValue)
      /* TODO: Add validation */
      if(thisWidget.correctValue !== newValue && thisWidget.isValid(newValue)) {
      thisWidget.correctValue = newValue;
      console.log('czy dziala')
      
    } 
    //thisWidget.dom.input.value = thisWidget.correctValue;
    thisWidget.renderValue();
    thisWidget.announce();
  }

  setValue(value){
    const thisWidget = this;
    
    thisWidget.value = value;
  }

  get value(){
    const thisWidget = this;

    return thisWidget.correctValue;
  }

  parseValue(value){
    return parseInt(value);
    }

    isValid(){
        // w nawiasie isVlid było value, ale npm pokazywał bład więc usunałem
        return true
      }

      renderValue(){
        const thisWidget = this;
        thisWidget.dom.wrapper.innerHTML = thisWidget.value;
      }

      announce(){
        const thisWidget = this;
        thisWidget.dom.wrapper.dispatchEvent(new CustomEvent ('updated', {bubbles: true}));
      }
}

export default BaseWidget;