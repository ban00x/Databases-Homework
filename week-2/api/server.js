 const { Pool } = require('pg');
 const pool = new Pool({
 	user: 'postgres',
 	host: 'localhost',
 	database: 'cyf_ecommerce',
 	password: 'Migracode',
 	port: 5432,
 });
const express = require('express');
const app = express();
const apiFunction = require('./api.js');
const api = apiFunction();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/customers', api.getAllCustomers);
app.get('/suppliers', api.getSuppliers);
app.get('/products', api.getProducts);

app.post('/customers/:customerId/orders', api.addOrderOfSpecificCustomer);
app.get('/customers/:customerId', api.getCustomerById);
app.get('/customers/:customerId/orders', api.getOrdersOfSpecificCustomer);
app.post('/customers', api.addNewCustomer);
app.post('/products', api.addNewProduct);
app.put('/customers/:customerId', api.updateExistingCustomer);

app.delete('/orders/:orderId', api.deleteOrderByID);
app.delete('/customers/:customerId', api.deleteCustomerById);

app.listen(3000, function () {
	console.log('Server is listening on port 3000. Ready to accept requests!');
});
