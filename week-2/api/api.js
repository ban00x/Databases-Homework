const { Pool } = require('pg');
const pool = new Pool({
	user: 'postgres',
	host: 'localhost',
	database: 'cyf_ecommerce',
	password: 'Migracode',
	port: 5432,
});
const api = () => {
	const getAllCustomers = (req, res) => {
		pool.query('SELECT * FROM customers', (error, result) => {
			res.json(result.rows);
		});
	};
	const getCustomerById = async (req, res) => {
		const customerId = req.params.customerId;
		const result = await pool.query(`SELECT * FROM customers WHERE id=$1`, [
			customerId,
		]);
		return res.status(200).json(result.rows);
	};
	const getSuppliers = (req, res) => {
		pool.query('SELECT * FROM suppliers', (error, result) => {
			res.json(result.rows);
		});
	};
	const getOrders = (req, res) => {
		pool.query('SELECT * FROM orders', (error, result) => {
			res.json(result.rows);
		});
	};

	const getOrdersOfSpecificCustomer = async (req, res) => {
		const customerId = req.params.customerId;
		const result = await pool.query(
			` SELECT p.product_name as productName, o.order_date AS orderDate,  p.unit_price AS unitPrice, oi.quantity, o.order_reference AS orderReference,s.supplier_name AS supplierName FROM customers c
        INNER JOIN orders o ON c.id=o.customer_id
        INNER JOIN order_items oi ON oi.order_id=o.id
        INNER JOIN products p ON oi.product_id=p.id
        INNER JOIN suppliers s ON p.supplier_id=s.id
        WHERE c.id=$1`,
			[customerId]
		);
		return res.status(200).json(result.rows);
	};
	const addNewCustomer = async (req, res) => {
		const newCustomer = req.body;
		const checkId = await pool.query('SELECT * FROM customers WHERE name=$1', [
			newCustomer.name,
		]);
		if (checkId.rows.length > 0) {
			return res
				.status(400)
				.send('A customer with the same name already exists!');
		} else {
			const query =
				'INSERT INTO customers (name, address, city,country) VALUES ($1, $2, $3, $4)';
			const result = await pool.query(query, [
				newCustomer.name,
				newCustomer.address,
				newCustomer.city,
				newCustomer.country,
			]);
			const responseBody = { message: 'Customer was added' };
			return res.status(200).json(responseBody);
		}
	};
	const getProducts = async (req, res) => {
		const productName = req.query.name;
		if (productName) {
			const result = await pool.query(
				`SELECT p.product_name,s.supplier_name FROM products p 
				INNER JOIN suppliers s ON s.id=p.supplier_id 
				WHERE LOWER(p.product_name) Like '%${productName.toLowerCase()}%'`
			);
			res.status(200).json(result.rows);
		} else {
			const result = await pool.query(
				'SELECT p.product_name,s.supplier_name FROM products p INNER JOIN suppliers s ON s.id=p.supplier_id'
			);
			return res.status(200).json(result.rows);
		}
	};
	const addNewProduct = async (req, res) => {
		const newProduct = req.body;
		if (!Number.isInteger(newProduct.unit_price)) {
			return res
				.status(400)
				.send('The unit price should be a positive integer.');
		}
		const supplierIdCheck = await pool.query(
			' SELECT supplier_id FROM products WHERE supplier_id=$1',
			[newProduct.supplier_id]
		);
		if (supplierIdCheck.rows.length < 1) {
			return res.status(400).send('The supplier with such id does not exist!');
		}
		const checkSameProductFromSameSupplier = await pool.query(
			'SELECT supplier_id FROM products WHERE supplier_id=$1 AND product_name=$2',
			[newProduct.supplier_id, newProduct.product_name]
		);
		if (checkSameProductFromSameSupplier.rows > 1) {
			return res
				.status(400)
				.send('The product from this supplier already exists!');
		} else {
			const query = await pool.query(
				'INSERT INTO products (product_name, unit_price,supplier_id) VALUES ($1, $2, $3) returning id',
				[newProduct.product_name, newProduct.unit_price, newProduct.supplier_id]
			);
			const responseBody = { productId: query.rows[0].id };
			return res.status(201).json(responseBody);
		}
	};

	const addOrderOfSpecificCustomer = async (req, res) => {
		const newOrder = req.body;
		const customerId = req.params.customerId;
		newOrder.customerId = customerId;
		const idExists = await pool.query(
			'SELECT customer_id FROM orders WHERE customer_id=$1',
			[customerId]
		);
		if (!idExists.rows.length > 1) {
			res.status(400).send("The customer with such id doesn't exist");
		}
		const query = await pool.query(
			'INSERT into orders (order_date, order_reference, customer_id) VALUES ($1,$2,$3) returning id',
			[newOrder.order_date, newOrder.order_reference, newOrder.customerId]
		);
		const responseBody = { orderId: query.rows[0].id };
		console.log(customerId);

		return res.status(201).json(responseBody);
	};
	const updateExistingCustomer = async (req, res) => {
		const newInfo = req.body;
		const customerId = req.params.customerId;
		newInfo.id = customerId;
		const query = await pool.query(
			'UPDATE customers SET  name=$1, address=$2,city=$3,country=$4 WHERE id=$5',
			[newInfo.name, newInfo.address, newInfo.city, newInfo.country, newInfo.id]
		);
		res.status(200).send(`Customer ${customerId} info was updated`);
	};
	const deleteOrderByID = async (req, res) => {
		const orderId = req.params.orderId;
		pool
			.query('DELETE FROM order_items WHERE order_id=$1', [orderId])
			.then(() => {
				pool
					.query('DELETE FROM orders WHERE id=$1', [orderId])
					.then(() => res.send(`Order ${orderId} deleted!`))
					.catch((e) => console.error(e));
			})
			.catch((e) => console.error(e));
	};
	const deleteCustomerById = (req, res) => {
		const customerId = req.params.customerId;
		pool
			.query('SELECT customer_id FROM orders WHERE customer_id=$1', [
				customerId,
			])
			.then((result) => {
				if (result.rows.length > 0) {
					return res
						.status(400)
						.send("This customer has orders and can't be deleted ");
				} else {
					pool
						.query('DELETE FROM customers WHERE id=$1', [customerId])
						.then(() => res.send(`Customer ${customerId} deleted!`))
						.catch((e) => console.error(e));
				}
			})

			.catch((e) => console.error(e));
	};
	return {
		getCustomerById,
		getOrdersOfSpecificCustomer,
		addNewCustomer,
		getAllCustomers,
		getSuppliers,
		getProducts,
		addNewProduct,
		addOrderOfSpecificCustomer,
		updateExistingCustomer,
		deleteOrderByID,
		deleteCustomerById,
		getOrders,
	};
};

module.exports = api;
