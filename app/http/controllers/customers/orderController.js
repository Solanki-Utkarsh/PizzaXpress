const order = require('../../../models/order');
const Order = require('../../../models/order')
const moment = require('moment')
function orderController(){
    return {
        store(req, res) {
            // console.log(req.body);
            const { phone, address} = req.body
            // console.log(phone);
            // console.log(address);
            if(!phone || !address){
                req.flash('error', 'All fields are required' )
                return res.redirect('/cart');
            }
            if(!req.session.cart){
                return res.redirect('/cart');
            }
            const order = new Order({
                customerId:  req.user._id,
                items: req.session.cart.items,
                phone: phone,
                address
            })
            // console.log(order);
            order.save().then(result =>{
                req.flash('success', 'Order placed successfully');
                delete req.session.cart;
                return res.redirect('/customer/orders');

            }).catch(err =>{
                console.log(err);
                req.flash('error', 'Something went wrong')
                return res.redirect('/cart');
            })
        },
        async index(req, res){
            const orders = await Order.find({customerId:req.user._id},
                null,
                {sort: {'createdAt': -1 }})
            res.header('Cache-Control', 'no-store')
            res.render('customers/orders', {orders: orders, moment: moment});
            
            // console.log(orders);
        },
        async show(req, res){
            const order = await Order.findById(req.params.id)
            
            //Authorize user
            if(req.user._id.toString() === order.customerId.toString()){
                return res.render('customers/singleOrder', {order: order});
            }
            return res.redirect('/');
            
        }
    }
}

module.exports = orderController