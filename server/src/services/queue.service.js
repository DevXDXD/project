const amqp = require('amqplib');

const queueName = 'crm_queue';

const createChannel = async () => {
  try {
    const connection = await amqp.connect('amqp://localhost');
    connection.on('error', (err) => {
      console.error('AMQP connection error:', err.message);
    });
  
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName, { durable: true });
    return channel;
  } catch (error) {
    console.error('Error establishing AMQP connection:', error.message);
    throw error; // Re-throw the error to let the caller know that the connection failed
  }
};

const publishMessage = async (message) => {
  const channel = await createChannel();
  try {
    await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
    console.log(`[x] Sent message: ${message}`);
  } catch (error) {
    console.error('Error publishing message:', error.message);
    throw error; // Re-throw the error to let the caller know that publishing failed
  }
};

const consumeMessages = async (callback) => {
  const channel = await createChannel();
  try {
    await channel.consume(queueName, (msg) => {
      const message = JSON.parse(msg.content.toString());
      callback(message);
      channel.ack(msg);
    });
    console.log('[*] Waiting for messages. To exit, press CTRL+C');
  } catch (error) {
    console.error('Error consuming messages:', error.message);
    throw error; // Re-throw the error to let the caller know that consuming failed
  }
};

module.exports = { publishMessage, consumeMessages };
