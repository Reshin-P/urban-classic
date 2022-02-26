$.ajax({
    url:'/offer/AddCoupen',
    method:'post',
    data:$('#AddCoupon').serialize(),
    success:(response)=>{
       if(response.status){
           Swal.fire({
position: 'center',
icon: 'success',
title: 'Coupon Added',
showConfirmButton: false,
timer: 2500
})
location.reload()

       }
       else if(response.exist){

Swal.fire('Coupon Code Exist')
       }
    }

})