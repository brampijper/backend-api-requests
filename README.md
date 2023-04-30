# Backend API Requests

This project is an example of how to make requests to a backend server from a client-side application. It uses the Fetch API to make HTTP requests, and demonstrates how to cache data in the browser for faster subsequent requests.

## Getting Started

To get started, clone this repository and navigate to the root directory in your terminal.

```bash
git clone https://github.com/brampijper/backend-api-requests.git
cd backend-api-requests
```

### Prerequisites

Before running this project, you will need to have [Node.js](https://nodejs.org/en/) and [npm](https://www.npmjs.com/) installed on your machine.

### Installing

To install the dependencies, run the following command:

```bash
npm install
```

### Usage

To start the server, run the following command:

```bash
npm run start
```

or if you want to use nodemon ( for live updates when a file changes on the server)

```bash
npm run dev
```

This will start the server at `http://localhost:3000`.

To make requests to the server from a client-side application, import the `fetchAndCacheData` function from `src/fetch.js`.

```javascript
import fetchAndCacheData from './fetch.js';

fetchAndCacheData('/api/data')
  .then(data => console.log(data))
  .catch(error => console.log(error));
```

This will make a GET request to `http://localhost:3000/api/data` and log the response data to the console. The `fetchAndCacheData` function will also cache the response data in the browser for faster subsequent requests.

### Contributing

Contributions are welcome! If you find a bug or would like to suggest a new feature, please open an issue or submit a pull request.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.