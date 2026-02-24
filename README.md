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
* **UI/UX:** The interface uses Tailwind CSS for styling. I implemented specific visual cues, such as color-coding "Real Users" (Registered via email) vs. "Simulated Guests" (Created locally), and disabling the delete button for real users to prevent database inconsistency.

### 3. Database & Orchestration (PostgreSQL & Docker)
Persistence and data integrity were major requirements for managing financial transactions. I utilized **PostgreSQL** to handle concurrent relationships between Users, Groups, and Expenses safely via `@Transactional` operations.

* **Docker Compose:** To simplify database management and ensure consistent environments, I created a `docker-compose.yml` file. This spins up a PostgreSQL container with persistent volumes, completely removing the need to manually install and configure a local SQL server. This keeps the host operating system clean and isolates the database environment perfectly during development.

## How to Run

1.  Ensure **Docker** and **Docker Compose** are installed.
2.  Navigate to the project root.
3.  Run the database:
    ```bash
    docker-compose up -d
    ```
4.  Start the Backend (API):
    ```bash
    cd api
    ./mvnw spring-boot:run
    ```
5.  Start the Frontend:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

---
*Developed by João Paulo Morais Rangel.*