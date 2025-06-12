import { SFNClient, SendTaskSuccessCommand } from "@aws-sdk/client-sfn";
const sfnClient = new SFNClient({});

var redirectToStepFunctions = function(lambdaArn, statemachineName, executionName, callback) {
  const lambdaArnTokens = lambdaArn.split(":");
  const partition = lambdaArnTokens[1];
  const region = lambdaArnTokens[3];
  const accountId = lambdaArnTokens[4];

  console.log("partition=" + partition);
  console.log("region=" + region);
  console.log("accountId=" + accountId);

  const executionArn = "arn:" + partition + ":states:" + region + ":" + accountId + ":execution:" + statemachineName + ":" + executionName;
  console.log("executionArn=" + executionArn);

  const url = "https://console.aws.amazon.com/states/home?region=" + region + "#/executions/details/" + executionArn;
  callback(null, {
    statusCode: 302,
    headers: {
      Location: url
    }
  });
};

export const handler = async (event, context, callback) => {
  try {
    console.log('Event= ' + JSON.stringify(event));
    const httpMethod = event.requestContext.httpMethod;
    const action = event.queryStringParameters.action;
    const taskToken = event.queryStringParameters.taskToken;
    const statemachineName = event.queryStringParameters.sm;
    const executionName = event.queryStringParameters.ex;

    var message = "";

    if (action === "approve") {
      message = { "Status": "Approved" };
    } else if (action === "reject") {
      message = { "Status": "Rejected" };
    } else {
      console.error("Unrecognized action. Expected: approve, reject.");
      callback({"Status": "Failed to process the request. Unrecognized Action."});
    }

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Confirmation Page</title>
      <style>
        body { font-family: Arial, sans-serif; background: #f0f0f0; padding: 2em; }
        .container { max-width: 600px; margin: auto; background: white; padding: 2em; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        h1 { color: #333; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Confirmation</h1>
        <p>Please confirm the step-functions action.
        <form action="" method="POST">
          <input type="submit" value="${action.charAt(0).toUpperCase() + action.slice(1)}">
        </form>
        </p>
      </div>
    </body>
    </html>
  `;

  // just display the form for a GET
  if (httpMethod == 'GET') {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: html,
    };
  } 

  // continue to step functions calls if we have a POST
  const input = { 
    output: JSON.stringify(message),
    taskToken: event.queryStringParameters.taskToken
  };

  await sfnClient.send(new SendTaskSuccessCommand(input));
  redirectToStepFunctions(context.invokedFunctionArn, statemachineName, executionName, callback);
  console.log("successfully sent:");
  
}
  catch (error) {
    console.log("Unable to status message to Step Function");
    throw new Error(JSON.stringify(error));
}

 
}