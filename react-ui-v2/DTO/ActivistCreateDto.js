export class ActivistCreateDto {
  constructor(voterKey, city_id, election_role_id) {
    this.send_sms=1;
    this.voter_key = voterKey;
    this.city_id = city_id;
    this.election_role_id = election_role_id;
    this.comment=''
  }
  
  voter_key;
  city_id;
  election_role_id;
  activists_allocation_id;
  email;
  comment;
  quarter_id;
  cluster_id;
  ballot_id;
  shift_system_name;
  phone_number;
  send_sms;
  day_sending_message;
  phones;
  car_seats;
  car_type;
  car_number;
  instructed;
}
