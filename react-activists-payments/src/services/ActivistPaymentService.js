import axios from "axios";

class ActivistPaymentService{

    update(activistPayment){
        return  axios({
            url: window.Laravel.baseURL + 'api/payments/activist-payment/'+activistPayment.id,
            method: 'put',
            data:activistPayment
        }).then(function (response){
            return response.data.data
        })

    }
}

export default new ActivistPaymentService()