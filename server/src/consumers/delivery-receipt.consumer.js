const { consumeMessages } = require('../services/queue.service');
const CommunicationLog = require('../models/CommunicationLog');
const connectDB = require('../config/db.config');

const BATCH_SIZE = 2; // Number of messages to process in a batch
const BATCH_INTERVAL = 5000; // Time interval to process the batch in milliseconds

let messageQueue = [];
let isProcessing = false; // Mutex flag
let wasQueueEmpty = true; // State to track if the queue was previously empty
let wasProcessing = false; // State to track if we were previously processing

const processBatch = async (messages) => {
  console.log(`[x] Processing batch of ${messages.length} messages`);
  for (const message of messages) {
    await handleMessage(message);
  }
  console.log(`[x] Batch processing complete`);
};

const handleMessage = async (message) => {
  try {
    console.log(`[x] Received message: ${JSON.stringify(message)}`);
    if (message.type === 'UPDATE_COMMUNICATION_LOG') {
      const { id, status } = message.payload;
      console.log(`[x] Updating CommunicationLog with id: ${id}, status: ${status}`);
      await CommunicationLog.findByIdAndUpdate(id, { status });
      console.log(`[x] Successfully updated CommunicationLog with id: ${id}`);
    } else {
      console.log(`[x] Unhandled message type: ${message.type}`);
    }
  } catch (err) {
    if (message.type === 'UPDATE_COMMUNICATION_LOG') {
      console.error(`[x] Error handling UPDATE_COMMUNICATION_LOG message: ${err}`);
    } else {
      console.log(`[x] Ignored error for message type: ${message.type}`);
    }
  }
};

const startBatchProcessor = () => {
  setInterval(async () => {
    if (messageQueue.length >= BATCH_SIZE && !isProcessing) {
      console.log(`[x] Batch interval reached. Checking message queue...`);
      isProcessing = true;
      console.log(`[x] Processing messages in queue. Queue length: ${messageQueue.length}`);
      const messagesToProcess = messageQueue.splice(0, BATCH_SIZE);
      await processBatch(messagesToProcess);
      isProcessing = false;
      wasQueueEmpty = false;
    } else if (isProcessing) {
      if (!wasProcessing) {
        console.log(`[x] Batch interval reached. Currently processing a batch. New messages will be processed in the next interval.`);
        wasProcessing = true;
      }
    } else {
      if (!wasQueueEmpty) {
        console.log(`[x] Batch interval reached. Message queue is empty. No messages to process.`);
        wasQueueEmpty = true;
      }
    }
  }, BATCH_INTERVAL);
};

const startConsumer = async () => {
  try {
    console.log('[x] Connecting to database...');
    await connectDB();
    console.log('[x] Connected to database');
    console.log('[x] Starting to consume messages...');
    consumeMessages((message) => {
      console.log(`[x] Message received for queueing: ${JSON.stringify(message)}`);
      messageQueue.push(message);
      wasQueueEmpty = false;
      wasProcessing = false;
      if (messageQueue.length >= BATCH_SIZE && !isProcessing) {
        isProcessing = true;
        console.log(`[x] Batch size reached. Processing batch of ${BATCH_SIZE} messages`);
        const messagesToProcess = messageQueue.splice(0, BATCH_SIZE);
        processBatch(messagesToProcess).then(() => {
          isProcessing = false;
        });
      } else {
        console.log(`[x] Message queued. Current queue length: ${messageQueue.length}`);
      }
    });
    startBatchProcessor();
  } catch (err) {
    console.error(`[x] Error starting consumer: ${err}`);
  }
};

startConsumer();
