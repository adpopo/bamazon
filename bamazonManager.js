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
	// prompt user
	inquirer.prompt({
	name: "action",
	type: "list",
	message: "What do you want to do?",
	choices: [ "View Products",
	"Check low inventory",
	"Add inventory",
	"Add new product"
	]}).then(function(answer){
		switch(answer.action){
			case("View Products"):
			// display products
			connection.query("SELECT * FROM `products`", function(err,res){
				for(i=0; i<res.length; i++){
					console.log("Item: " + res[i].product_name);
					console.log("Price: " + res[i].price);
					console.log("Item ID: " + res[i].item_id);
					console.log("In Stock: " + res[i].stock_quantity);
					console.log("==================================\n");
				}
				return app();
			});
			break;

			case("Check low inventory"):
			// display low inventory
			connection.query("SELECT * FROM `products`", function(err, res){
				for(i=0; i<res.length; i++){
					if(res[i].stock_quantity<5){
						console.log("Item: " + res[i].product_name);
						console.log("Price: " + res[i].price);
						console.log("Item ID: " + res[i].item_id);
						console.log("In Stock: " + res[i].stock_quantity);
						console.log("==================================\n");
					}
				}
				return app();
			});
			break;

			case("Add inventory"):
			// add inventory
			inquirer.prompt([{
				name: "id",
				type: "input",
				message: "What do you want to add to? (Use product ID)"
			},
			{
				name: "num",
				type: "input",
				message: "How many are you adding?"
			}]).then(function(answer){
				// check for valid values
				var id = parseInt(answer.id);
				var num = parseInt(answer.num);
				if(isNaN(id)||isNaN(num)){
					console.log("Please learn to read the instructions");
					return app();
				}
				// get current stock
				connection.query("SELECT * FROM `products`", function(err,res){
					if(id>res.length){
						console.log("Please learn to read the instructions");
						return app();
					}
					else{
						// add to stock
						var inStock = res[id-1].stock_quantity;
						connection.query("UPDATE `products` SET ? WHERE ?", [{
							stock_quantity: (inStock+num)
						},{
							item_id: id
						}
						], function(err,res){
							console.log("You've added "+num+" units");
							console.log("You now have "+(num+inStock)+" in stock");
							return app();
						});
					}
				});
			});
			break;

			case("Add new product"):
			// ask about product
			inquirer.prompt([{
				name: "name",
				type: "input",
				message: "What do you want to add?"
			},
			{
				name: "num",
				type: "input",
				message: "How many are you adding?"
			},
			{
				name: "price",
				type: "input",
				message: "How much does it cost?"
			},
			{
				name: "dept",
				type: "input",
				message: "What department does it belong to?"
			}]).then(function(answer){
				// convert strings to numbers
				var num = parseInt(answer.num);
				var price = parseFloat(answer.price);

				// check for valid input
				if(isNaN(num)||isNaN(price)){
					console.log("Please stop wasting my time with fake numbers");
					return app();
				}

				// input into db
				connection.query("INSERT INTO `products` SET ?",{
					price: price,
					stock_quantity: num,
					product_name: answer.name
				}, function(err,res){
					console.log("You've added " + answer.name + " to the store");
					console.log("You added " + num + " units at $" + price + " each");
					return app();
				});
			});
			break;
		}
	});
}

// connect to database
connection.connect(function(err) {
	if (err) throw err;
	//runtime
    app();
});