class BaseWidget{
    constructor(wrapperElement, initialValue){
        const thisWidget = this;
        thisWidget.dom = {};
        thisWidget.dom.wrapper = wrapperElement;

        thisWidget.correctValue = initialValue;
    }

    set Value(value){
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

  setValue(value){
    const thiWidget = this;
    
    thisWidget.value = value;
  }

  get Value(){
    const thisWidget = this;

    return thisWidget.correctValue;
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
        thisWidget.dom.wrapper.innerHTML = thisWidget.value;
      }

      announce(){
        const thisWidget = this;
        thisWidget.dom.wrapper.dispatchEvent(new Event('updated'));
        const event = new CustomEvent ('updated', {bubbles: true});
      }
}

export default BaseWidget;