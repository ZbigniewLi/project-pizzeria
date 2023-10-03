import { templates, select, settings } from "../settings.js";
import AmountWidget from "./AmountWidget.js";
import utils from "../utils.js";
import HourPicker from "./HourPicker.js";
import datePicker from "./DatePicker.js";
import DatePicker from "./DatePicker.js";

class Booking {
    constructor(element){
        const thisBooking = this;

        this.render(element);
        this.initWidgets();
        thisBooking.getData();
    }

    getData(){
        const thisBooking = this;

        const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
        const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

        const params = {
            bookings: [
                startDateParam,
                endDateParam,
            ],
            eventsCurrent: [
                settings.db.notRepeatParam,
                startDateParam,
                endDateParam,
            ],
            eventsRepeat: [
                settings.db.repeatParam,
               endDateParam,
            ],
        }
        //console.log('getData params', params)

        const urls = {
            booking: settings.db.url + '/' + settings.db.bookings + '?' + params.bookings.join('&'),
            eventsCurrent: settings.db.url + '/' + settings.db.events + '?' + params.eventsCurrent.join('&'),
            eventsRepeat: settings.db.url + '/' + settings.db.events + '?' + params.eventsRepeat.join('&') ,
        };
        
        Promise.all([
            fetch(urls.booking),
            fetch(urls.eventsCurrent),
            fetch(urls.eventsRepeat),
        ])

        .then(function(allResponses){
            const bookingResponse = allResponses[0];
            const eventsCurrentResponse = allResponses[1];
            const eventsRepeatResponse = allResponses[2];

            return Promise.all([
                bookingResponse.json(),
               eventsCurrentResponse.json(),
                eventsRepeatResponse.json(),
            ]);
        })
        .then(function([bookings, eventsCurrent, eventsRepeat]){
            console.log(bookings);
            console.log(eventsCurrent);
            console.log(eventsRepeat);
        })
        
    }

    render(element){
       

    this.dom = {};
    this.dom.wrapper = element;
    this.dom.wrapper.innerHTML = templates.bookingWidget();
    this.dom.peopleAmount = this.dom.wrapper.querySelector(select.booking.peopleAmount);
    this.dom.hoursAmount = this.dom.wrapper.querySelector(select.booking.hoursAmount);
    console.log(templates.bookingWidget());
    this.dom.datePicker = this.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    this.dom.hourPicker = this.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
}
    initWidgets(){
        const thisWidget = this;

        thisWidget.peopleAmount = new AmountWidget(this.dom.peopleAmount);
        thisWidget.hoursAmount = new AmountWidget(this.dom.hoursAmount);
        thisWidget.datePicker = new DatePicker(this.dom.datePicker);
        thisWidget.hourPicker = new HourPicker(this.dom.hourPicker);
        

    }
}
export default Booking;