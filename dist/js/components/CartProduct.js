import {  select} from "../settings.js";
import AmountWidget from "./AmountWidget.js";

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
export default CartProduct;