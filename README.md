# Wushu Referee App

Welcome to the thrilling world of Wushu competition, reimagined for the Festival! Our Wushu Referee App is here to revolutionize refereeing and match management, making these tasks as smooth and exciting as the fights themselves.

## Table of Contents

1. [What is it?](#what-is-it)
2. [Key Features](#key-features)
3. [Technologies Used](#technologies-used)
4. [Features](#features)
5. [Installation](#installation)
6. [Usage](#usage)
7. [Contributing](#contributing)
8. [License](#license)
9. [Contact](#contact)
10. [Acknowledgments](#acknowledgments)

## What is it?

Imagine an elegant and intuitive application that allows referees and TV admins to manage matches in real-time, with style and efficiency. Whether you're behind the scenes or at the heart of the action, our app provides all the features you need to ensure precise scoring and efficient match management.

## Key Features

- **Match Room Creation:** Separate each match into its own dedicated room. Invite referees and TV admins to join the action!
- **Real-Time Management:** Utilize Node.js, Express, and Socket.IO for a real-time web experience. No delays, just instant action.
- **Round Control:** Admins can select rounds, start, pause, or restart the timer. Maintain total control over the flow of the fights.
- **Scoring and Results:** Referees can submit the winner of each round, and admins can view the results at a glance.
- **TV View:** Display the results of each round and the overall winner on a TV screen. With a countdown and a redirect button to the winner's page, it's a guaranteed spectacle!

## Technologies Used

- **Back-end:** Node.js, Express, and Socket.IO for robust and real-time performance.
- **Front-end:** HTML, CSS, and JavaScript for a clean and responsive user interface.

## Features

- **Real-time Scoring:** Instant updates to match scores.
- **Role-based Access:** Separate interfaces for admins, referees, and spectators.
- **Match Management:** Create and manage match rooms, track participants, and control the flow of the match.
- **Audience Display:** Broadcast match scores and details on a big screen.
- **Sound Notifications:** Audio alerts for score changes and important match events.
- **Dynamic Room Management:** Create and manage match rooms dynamically.

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

### Steps

1. **Clone the Repository**
    ```bash
    git clone https://github.com/khalilsaw/Taekwondo-Referee-app.git
    ```

2. **Navigate to the Project Directory**
    ```bash
    cd Taekwondo-Referee-app
    ```

3. **Install Dependencies**
    ```bash
    npm install
    ```

4. **Start the Application**
    ```bash
    node server.js
    ```

## Usage

1. **Launch the Application**
    Open your browser and navigate to `http://localhost:3000`.

2. **Admin Interface**
    - URL: `http://localhost:3000/:username/admin/:roomid`
    - Set up and manage matches.

3. **Referee Interface**
    - URL: `http://localhost:3000/:username/arbitre/:roomid`
    - Input and update scores during the match.

4. **Audience Display**
    - URL: `http://localhost:3000/:username/tv/:roomid`
    - Display real-time scores and match details to spectators.

5. **Other Roles**
    - Winner Display: `http://localhost:3000/:username/winner/:roomid`
    - Players Display: `http://localhost:3000/:username/tvplayers/:roomid`

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a Pull Request.

## License

This project is licensed under the Apache-2.0 License. See the [LICENSE](./LICENSE) file for details.

## Contact

For questions or feedback, please open an issue on the repository or contact the maintainer at khalilbadre5@gmail.com .

## Acknowledgments

We appreciate all contributors and users of the wushu Referee App. Special thanks to the Taekwondo community for their support and feedback.




### Server Code Overview

The `server.js` script uses Node.js and Express to serve the application and manage WebSocket connections using Socket.io. It handles the following:

- **Static File Serving:** Serves images, CSS, and sound files.
- **WebSocket Connections:** Manages real-time communication for score updates and match management.
- **Room Management:** Handles the creation and verification of match rooms, user roles, and score submissions.
- **Score Broadcast:** Emits score updates and match events to connected clients.
