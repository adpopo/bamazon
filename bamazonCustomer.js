// require stuff
var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,

	// Your username
	user: "root",

	// Your password
	password: "root",
	database: "bamazon"
});

// main runtime function
function app() {
	// display items
	connection.query("SELECT * FROM `products`", function(err,res){
		for(i=0; i<res.length; i++){
			console.log("Item: " + res[i].product_name);
			console.log("Price: " + res[i].price);
			console.log("Item ID: " + res[i].item_id);
			console.log("==================================\n");
		}
		return usrPrompt();
	});
};

function usrPrompt(){
	// prompt user
	inquirer.prompt([{
	name: "item",
	type: "input",
	message: "What do you want to buy? (Select by ID number)"
	},
	{
	name: "quantity",
	type: "input",
	message: "How many do you want?"
	}
	]).then(function(answer) {

	// convert input to numbers
	var id = parseInt(answer.item);
	var num = parseInt(answer.quantity);

	// check for bad answers - id
	if(isNaN(id) || isNaN(num)){
		console.log("Please follow the instructions");
		return usrPrompt();
	}

	// placeholder vars
	var inStock = 0;
	var price = 0.00;

	// check if in stock
	connection.query("SELECT * FROM `products` WHERE ?", {item_id: id},
		function(err, res){
			if(res.length==0){
				console.log("Item does not exist");
				return usrPrompt();
			}
			inStock = res[0].stock_quantity;
			price = res[0].price;
			// if not in stock
			if(num > inStock){
				console.log("Insufficient quantity!");
				return usrPrompt();
			}
			// if in stock, change quantity
			connection.query("UPDATE products SET ? WHERE ?", [{
				stock_quantity: (inStock-num)
			},{
				item_id: id
			}], function(err, res){
				// tell user quantity purchased, total price and remaining units
				console.log("You've bought " + num + " items");
				console.log("Your purchase total is: " + (price*num));
				console.log("There are " + (inStock-num) + " units remaining");
				return usrPrompt();
			});
		});
	});
}

// connect to database
connection.connect(function(err) {
	if (err) throw err;
	//runtime
    app();
});