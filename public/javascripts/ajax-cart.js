


function addToCart(ProdID) {
   



    $.ajax({
        url: '/cart/add-Cart/'+ProdID,
        method: 'get',
        success: (response) => {
            if (response.status) {
              
                let count = $('#cart-count').html()
                count = parseInt(count)+1
                $("#cart-count").html(count)
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Add To Cart',
                    showConfirmButton: false,
                    timer: 1500
                })
            }else if(response.NoUser){


                Swal.fire({
                    title: 'First You Want Login.',
                    width: 600,
                    padding: '3em',
                    color: '#716add',
                    background: '#fff url(/images/trees.png)',
                    backdrop: `
                      rgba(0,0,123,0.4)
                      url("/images/nyan-cat.gif")
                      left top
                      no-repeat
                    `
                  })
            }

        }
    })

    
}

function addToCartFromWishlist(ProdID) {


    $.ajax({
        url: '/cart/add-CartFromWishlist/' + ProdID,
        method: 'get',
        success: (response) => {
            
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Add To Cart',
                showConfirmButton: false,
                timer: 1500
            })
            location.reload()
            
           
        }
    })
}


function AddToWishlist(ProdId) {
   


    $.ajax({
        url: '/AddToWishlist/' + ProdId,
        method: 'get',
        success: (response) => {
            console.log(response);
            if (response.status) {
               
                let count = $('#wish-count').html()
                count = parseInt(count) + 1
                $('#wish-count').html(count)

                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Add To Wishlist',
                    showConfirmButton: false,
                    timer: 1500
                })
            }
            else if (response.ProductExist) {


                Swal.fire('Already In Wishlist')

            }else if(response.NoUser){
                
                Swal.fire({
                    title: 'First You Want Login.',
                    width: 600,
                    padding: '3em',
                    color: '#716add',
                    background: '#fff url(/images/trees.png)',
                    backdrop: `
                      rgba(0,0,123,0.4)
                      url("/images/nyan-cat.gif")
                      left top
                      no-repeat
                    `
                  })
            }

        }
    })

}


function removeFromWishlist(ProdID) {
    Swal.fire({
        title: 'Are you sure?',
        text: "Do You Want To Remove",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/removeFromWishlist/' + ProdID,
                method: 'get',
                success: (response) => {
                    console.log(response);
                 if(response.removeProduct){
                     location.reload()
        
                 }
                }
            })
          Swal.fire(
            'Deleted!',
            'Your file has been deleted.',
            'success'
          )
        }
      })

  

}