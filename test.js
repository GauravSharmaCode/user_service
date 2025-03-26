import axios from 'axios';
import 'dotenv/config';

const TEST_URL = process.env.TEST_URL || "http://localhost:4000/notify";

async function testNotifyEndpoint() {
    console.log('\n Starting notification service tests...\n');

    try {
        const response = await axios.post(TEST_URL, {
            user_id: 1,
            message: "Test notification message"
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Test 1: Check if response is successful
        console.log('Test 1: Response Status');
        console.log('Expected: 200');
        console.log('Received:', response.status);
        console.log('Result:', response.status === 200 ? 'PASS' : 'FAIL');

        // Test 2: Check response message
        console.log('\nTest 2: Response Message');
        console.log('Expected: { message: "Notification sent" }');
        console.log('Received:', response.data);
        console.log('Result:', response.data.message === 'Notification sent' ? 'PASS' : 'FAIL');

    } catch (error) {
        if (error.response) {
            // Server responded with error
            console.error('\n Test failed with status:', error.response.status);
            console.error('Error data:', error.response.data);
        } else if (error.request) {
            // Request made but no response
            console.error('\n No response received...');
        } else {
            // Error in request setup
            console.error('\n Error:', error.message);
        }
    }
}

// Run the test
testNotifyEndpoint();