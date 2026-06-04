# Social Ledger

[![Project Walkthrough](https://img.shields.io/badge/YouTube-Video_Walkthrough-red?logo=youtube)](https://youtu.be/PRmj3z5oheQ?si=9RBp1UMrK8KG6GMA)

## Description

Social Ledger is a full-stack financial simulation tool designed to solve the complexity of shared expenses among groups of friends, roommates, or travel partners. Inspired by the "Splitwise" concept but built with a focus on UI/UX, data privacy and self-hosting, this application allows users to create simulation groups, register "guest" participants, log expenses, and automatically calculate the most efficient way to settle debts.

To ensure a robust and scalable application, I architected a completely decoupled system using **Java (Spring Boot)** for the backend, **React (TypeScript)** for the frontend, and **PostgreSQL** for the database, all orchestrated via **Docker**.

## Project Structure & Design Choices

### 1. The Backend (Java Spring Boot)
Located in the `/api` directory, the backend follows a Clean Architecture approach with a strict separation of concerns. I chose Java because of its strong typing and robust ecosystem for enterprise-grade applications.

* **Controllers & Use Cases:** I implemented RESTful endpoints using `RestController`. For example, `GroupController.java` acts as a pure routing layer, handing off the business logic for creating simulation groups and adding members to dedicated classes like `CreateGroupUseCase.java`.
* **Security:** Instead of using simple session cookies, I implemented a custom security filter chain (`SecurityConfig.java` and `SimpleAuthFilter.java`). The application uses BCrypt to hash passwords before storing them in the database. A custom header (`X-User-Id`) is used to maintain stateless session context, allowing the React frontend to communicate securely with the API.
* **The Algorithm:** One of the core features is the settlement logic. In `SettleDebtsUseCase.java`, I implemented an algorithm that takes a list of expenses, calculates the net balance for every user, and then uses a greedy approach with Priority Queues to determine the minimum number of transactions required to zero out all debts. This solves the complex "N-person" debt graph problem.

### 2. The Frontend (React + TypeScript)
Located in the `/frontend` directory, the user interface is built with Vite and React. I chose React to provide a Single Page Application (SPA) experience that feels faster and more responsive than server-side rendered templates.

* **State Management:** I used React Hooks (`useState`, `useEffect`, `useCallback`) to manage complex states, such as the Dashboard loading sequence. I encountered race conditions where the Dashboard would try to load data for deleted groups, which I solved by implementing a robust initialization effect that validates group existence before fetching details.
* **Axios Interceptors:** To handle the multi-user simulation logic, I configured an Axios interceptor that automatically injects the active user's ID into every HTTP request header. This ensures that users only interact with their own secure context.
* **Web Server & Reverse Proxy (Nginx):** The application relies on Nginx to serve the optimized static files. More importantly, Nginx acts as a reverse proxy, intercepting any requests to `/api` and routing them to the backend container. This completely eliminates CORS issues and the need for hardcoded absolute URLs in the frontend code.

### 3. Database & Orchestration (PostgreSQL & Docker)
To guarantee a consistent environment across any machine and completely remove the hassle of local dependencies (like installing Node, Java, or SQL servers locally), the entire application is containerized using **Docker** and **Docker Compose**.

* **Multi-stage Builds:** Both the frontend and backend utilize multi-stage `Dockerfile`s. This means the code is compiled inside the containers (using Maven and Node) but served using highly lightweight runtime images (Alpine JRE and Nginx), drastically reducing the final image size and improving security.
* **Isolated Network:** The three containers (Frontend, API, and DB) run inside a private internal bridge network (`social-network`). The services communicate using container DNS names instead of `localhost`, ensuring proper network isolation. Only the Nginx port 80 is exposed to the host machine.
* **Data Persistence:** PostgreSQL handles concurrent relationships and transactional data safely. A dedicated Docker volume (`postgres_data`) is attached to the database container to ensure all financial records persist even if the containers are destroyed.

## How to Run

1. Ensure **Docker** and **Docker Compose** are installed on your machine.
2. Navigate to the project root directory.
3. Build the images and spin up the entire stack in detached mode:
    ```bash
    docker compose up -d --build
    ```
4. Wait a few seconds for the database and API to initialize, then access the application in your browser:
    ```bash
    http://localhost
    ```
-  Useful Commands:

   - To view live logs: docker compose logs -f

   - To stop the application: docker compose down

   - To completely wipe the application and database volumes: docker compose down -v

---
*Developed by João Paulo Morais Rangel.*