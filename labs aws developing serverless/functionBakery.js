let bakery = ["Tart", "Bagel", "Brownie", "Cronut", "Pastry", "Loaf bread", 
  "Cookie", "Croissant", "Cake", "Cheesecake", "Pie", "Muffin", "Pretzel", "Doughnut", 
  "Danish", "Sweet roll", "Cinnamon roll", "Coffee cake"];

exports.handler = async (event, context) => {
    console.log("Event", JSON.stringify(event));
    var len = bakery.length;
    var idx = getRandomArbitrary(0, len-1);
    var snack = bakery[idx];
    console.log("next snack:", snack);
        
    const response = {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/html',
        },
        body: "<html><b>Here is my next snack pick: </b><i>"+ snack + "</i> <br><i>(Refresh the page for the next pick)</i></html>",
    };
    return response;
};

function getRandomArbitrary(min, max) {
  return  Math.floor(Math.random() * (max - min) + min);
}
