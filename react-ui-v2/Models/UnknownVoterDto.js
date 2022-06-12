export class UnknownVoterDto{
    birth_date
    birth_date_type
    city_id
    city_name
    email
    first_name
    flat
    gender
    house
    house_entry
    last_name
    neighborhood
    passport
    personal_identity
    phone1
    phone2
    street
    street_id
    zip

    static  getHashFieldToDisplay() {
       return {
            birth_date:'תאריך לידה',
            city_name:'עיר',
            email:'מייל',
            first_name:'שם פרטי',
            flat:'בית',
            gender:'מגדר',
            house:'בית',
            house_entry:'כניסה',
            last_name:'שם משפחה',
            neighborhood:'שכונה',
            passport:'דרכון',
            personal_identity:'תעודת זהות',
            phone1:'טלפון',
            phone2:'נייד',
            street:'רחוב',
            zip:'מיקוד'
        }
    }
}