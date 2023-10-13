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
        thisBooking.selectedTable = null;
    }

    pickTable(table){
        const thisBooking = this;

        if (!table.classList.contains(classNames.booking.tableBooked)){
            const tableId = table.getAttribute(settings.booking.tableIdAttribute);
            if(tableId == thisBooking.selectedTable){
                table.classList.remove(classNames.booking.tableSelected);
                thisBooking.selectedTable = null;
            } else {
                if(thisBooking.selectedTable){
                    const activeTable = thisBooking.dom.wrapper.querySelector(select.booking.tableSelected);
                    activeTable.classList.remove(classNames.booking.tableSelected);
                }
                 table.classList.add(classNames.booking.tableSelected);
        thisBooking.selectedTable = tableId;
            }
        } else {
            alert ('ten stolik jest zajęty');
        }
    }

    updateDOM(){
        const thisBooking = this;

        thisBooking.date =thisBooking.datePicker.value;
        thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

        let allAvailable = false;

        if(thisBooking.selectedTable){
            const activeTable = thisBooking.dom.wrapper.querySelector(select.booking.tableSelected);
            activeTable.classList.remove(classNames.booking.tableSelected);
            thisBooking.selectedTable = null;
        }
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
                thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
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

        const minDate = thisBooking.datePicker.minDate;
        const maxDate = thisBooking.datePicker.maxDate;

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

        for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock+= 0.5){

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
    this.dom.tables = this.dom.wrapper.querySelectorAll(select.booking.tables);
    this.dom.starters = this.dom.wrapper.querySelectorAll(select.booking.starters);
    this.dom.form = this.dom.wrapper.querySelector(select.booking.form);
    this.dom.phone = this.dom.wrapper.querySelector(select.booking.phone);
    this.dom.address = this.dom.wrapper.querySelector(select.booking.address);
}
    /*initWidgets(){
        const thisWidget = this;

        thisWidget.peopleAmount = new AmountWidget(this.dom.peopleAmount);
        thisWidget.hoursAmount = new AmountWidget(this.dom.hoursAmount);
        thisWidget.datePicker = new DatePicker(this.dom.datePicker);
        thisWidget.hourPicker = new HourPicker(this.dom.hourPicker);

        thisBooking.dom.wrapper.addeventListener('updated', function (){
            thisBooking.updateDOM();
        })
    }*/

    initWidgets(){
        const thisBooking = this;

        thisBooking.peopleAmount = new AmountWidget(this.dom.peopleAmount);
        thisBooking.hoursAmount = new AmountWidget(this.dom.hoursAmount);
        thisBooking.datePicker = new DatePicker(this.dom.datePicker);
        thisBooking.hourPicker = new HourPicker(this.dom.hourPicker);
        thisBooking.dom.form.addEventListener('submit', function(event){
            event.preventDefault();
            thisBooking.sendBooking();
        })

        thisBooking.dom.wrapper.addEventListener('updated', function (){
            thisBooking.updateDOM();
        })
    for(let table of thisBooking.dom.tables){
        table.addEventListener('click', function(){
            thisBooking.pickTable(table);
        })
    }
    }
    
    sendBooking(){
        const thisBooking = this;
        const url = settings.db.url + '/' + settings.db.bookings;
        const payload = {
            
            date: thisBooking.datePicker.value,//data wybrana w datePickerze
            hour: thisBooking.hourPicker.value, //godzina wybrana w hourPickerze (w formacie HH:ss)
            table: thisBooking.selectedTable, //numer wybranego stolika (lub null jeśli nic nie wybrano)
            duration: thisBooking.hoursAmount.value, //liczba godzin wybrana przez klienta
            ppl: thisBooking.peopleAmount.value, //liczba osób wybrana przez klienta
            starters: [],
            phone: thisBooking.dom.phone.value, //numer telefonu z formularza,
            address: thisBooking.dom.address.value, //adres z formularza
            
          }
          for(let starter of thisBooking.dom.starters) {
            if(starter.checked) payload.starters.push(starter.value);
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
  
}
export default Booking;