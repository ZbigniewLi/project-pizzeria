import { settings, select   } from "../settings.js";
import BaseWidget from "./BaseWidget.js";

class AmountWidget extends BaseWidget{
    constructor(element){
      super(element, settings.amountWidget.defaultValue);

      const thisWidget = this;
      //console.log('AmountWidget:' , thisWidget);
      //console.log('constructor arguments:' , element);
      thisWidget.getElements(element);
      thisWidget.initActions();
      thisWidget.setValue(thisWidget.dom.input.value||settings.amountWidget.defaultValue)
      
    }

    getElements(){
      const thisWidget = this;
     
     // thisWidget.dom.wrapper = element;
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
 
    renderValue(){
      const thisWidget = this;
      thisWidget.dom.input.value = thisWidget.value;
      console.log('tekstt')
    }

    isValid(value){
    // cot tutaj dodaC??????
      return !isNaN(value);
    }  
}


  export default AmountWidget;