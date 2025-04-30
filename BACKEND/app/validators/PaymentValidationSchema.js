export const PaymentValidationSchema = {
    paymentStatus:{
        in:['body'],
        custom:{
            options:async(value,{req})=>{
                const userRole = req.user?.role

                if(userRole !== 'admin'){
                    throw new Error('only admin can update payment status')
                }

                const validPaymentStatus = ['pending','completed','refunded']
                if(!validPaymentStatus.includes(value)){
                    throw new Error('choose one payment status')
                }
                return true
            }
        }
    }
}