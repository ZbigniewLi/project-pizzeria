import { settings, classNames, select, templates, } from "../settings.js";
import CartProduct from "./CartProduct.js";
import utils from "../utils.js";

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

  export default Cart;