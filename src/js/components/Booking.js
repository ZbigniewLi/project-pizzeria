import { templates, select, settings, classNames } from "../settings.js";
import AmountWidget from "./AmountWidget.js";
import utils from "../utils.js";
import HourPicker from "./HourPicker.js";
import DatePicker from "./DatePicker.js";

class Booking {
    constructor(element){
        const thisBooking = this;

        this.render(element);
        this.initWidgets();
        thisBooking.getData();
    }

    updateDOM(){
        const thisBooking = this;

        thisBooking.date =thisBooking.datePicker.value;
        thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

        let allAvailable = false;

        if(
            typeof thisBooking.booked[thisBooking.date] == 'undefined'
            ||
            typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
        ){
            allAvailable = true;
        }
        for(let table of thisBooking.dom.tables){
            let tableId = table.getAttribute(settings.booking.tableIdAttribute);
            if(!isNaN(tableId)){
                tableId = parseInt(tableId);
            }
            if(
                !allAvailable
                &&
                thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) > -1
            ){ 
                table.classList.add(classNames.booking.tableBooked);
            } else {
                table.classList.remove(classNames.booking.tableBooked);
            }
        }

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
            /*console.log(bookings);
            console.log(eventsCurrent);
            console.log(eventsRepeat);*/
            thisBooking.parseData(bookings, eventsCurrent, eventsRepeat)
        })
    }

    parseData(bookings, eventsCurrent, eventsRepeat){
        const thisBooking = this;

        thisBooking.booked = {};

        for(let item of bookings){
        thisBooking.makeBooked(item.date, item.hour, item.duration, item.table)
        }

        for(let item of eventsCurrent){
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table)
        }

        const minDate = thisBooking.datepicker.minDate;
        const maxDate = thisBooking.datepicker.maxDate;

            for(let item of eventsRepeat){
                if(item.repeat == 'daily'){
                    for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1))
                thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table)
                }
            }
            thisBooking.updateDOM();
    }

    makeBooked(date, hour, duration, table){
        const thisBooking = this;
        if(typeof thisBooking.booked[date] == 'undefined'){
            thisBooking.booked[date] = {};
        }

        const startHour = utils.hourToNumber(hour)

        for(let hourBlock = startHour; hourBlock < hourBlock + duration; hourBlock+= 0.5){

            if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
             thisBooking.booked[date][hourBlock] = [];
         }

         thisBooking.booked[date][hourBlock].push(table)
        }
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

        thisBooking.dom.wrapper.addeventListener('updated', function (){
            thisBooking.updateDOM();
        })
    }
}
export default Booking;