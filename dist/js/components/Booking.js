import AmountWidget from "./AmountWidget";

class Booking {
    constructor(element){
        const thisBooking = this;

        thisBooking = element;
        this.render();
        this.initWidgets();

    }
    render(){
        const templates = {
            bookingWidget:
    };

    this.dom = {};
    this.dom.wrapper = this.Booking;
    this.dom.wrapper.innerHTML = templates.bookingWidget;
    this.dom.peopleAmount = this.dom.wrapper.querySelector(select.booking.peopleAmount);
    this.dom.hoursAmount = this.dom.wrapper.querySelector(select.booking.hoursAmount);
}
    initWidgets(){

    }
}
export default Booking;