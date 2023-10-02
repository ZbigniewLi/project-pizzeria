class BaseWidget{
    constructor(wrapperElement, initialValue){
        const thisWidget = this;
        thisWidget.dom = {};
        thisWidget.dom.wrapper = wrapperElement;

        thisWidget.correctValue = initialValue;
    }

    setValue(value){
        const thisWidget = this;
  
        const newValue = thisWidget.parseValue(value)
        const minValue = settings.amountWidget.defaultMin;
        const maxValue = settings.amountWidget.defaultMax;
        
      /* TODO: Add validation */
      if(thisWidget.correctValue !== newValue && !isNaN(newValue)) {
      thisWidget.correctValue = newValue;
      
    } if (newValue < minValue) {
      thisWidget.correctValue = minValue;
    } if (newValue > maxValue) {
      thisWidget.correctValue = maxValue;
    }
    //thisWidget.dom.input.value = thisWidget.correctValue;
    thisWidget.renderValue();
    thisWidget.announce();
  }

  parseValue(value){
    return parseInt(value);
    }

    isValid(value){
        // cot tutaj dodaC??????
        return value
      }

      renderValue(){
        const thisWidget = this;
        thisWidget.dom.wrapper.innerHTML = thisWidget.correctValue;
      }

      announce(){
        const thisWidget = this;
        thisWidget.dom.wrapper.dispatchEvent(new Event('updated'));
        const event = new CustomEvent ('updated', {bubbles: true});
      }
}

export default BaseWidget;