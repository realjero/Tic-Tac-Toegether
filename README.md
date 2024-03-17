# Tic Tac Together

`Mert Ali Özmeral, Sebastian Adam Heinrich Knauf, Eike Torben Menzel & Jerome-Pascal Habanz`

# Home

## Queue

**Authentication**:

- Before accessing the queue, ensure that you are authenticated and logged into your account.

**Modal Display**:

- Upon clicking the "Play Now" button, a modal window will appear, indicating that you have been added to the matchmaking queue.

**Feedback and Waiting**:

- You can choose to cancel or leave the queue by simply closing the modal window.

**Match Found**:

- If a suitable match is found, the system will check the opponent's ELO rating.
- If the opponent's ELO rating is within 200 points of your rating, the match is considered valid.
- You will be notified that a match has been found, and you will be redirected to the game interface to start playing.

**ELO Discrepancy**:

- If the opponent's ELO rating differs by more than 200 points from your rating, the match will not proceed.
- In such cases, you will remain in the queue while the system continues searching for a suitable opponent.

# Profile

## User

The User profile section provides essential information about the user's account and activity within the application.

- **Profile Image**: Displays the user's chosen profile image or avatar.
- **ELO**: Indicates the user's current ELO rating, reflecting their skill level in the game.
- **Username**: Unique identifier for the user's account.
- **Change Profile Image**: Allows the user to upload or modify their profile image or avatar.
- **Change Username**: Enables users to update their account username as needed.
- **Change Password**: Provides the functionality for the user to update their account password securely, with the option to toggle password visibility.

## Statistics

The Statistics section presents various metrics and analytics related to the user's gameplay and performance.

### PieChart

The PieChart visually represents the distribution of the user's game outcomes.

- **Win Rate**: Percentage of games won by the user.
- **Total Games Played**: Overall count of games participated in by the user.
- **PieChart Composition**: Consists of segments representing Wins, Draws, and Losses, providing an overview of the user's performance.

### Game Analytics

The Game Analytics section offers insights into the user's gameplay trends and historical data.

- **History**: Logs of past game sessions, detailing outcomes and resulting ELO.
- **Elo Over Time (LineChart)**: Graphical representation illustrating changes in the user's ELO rating over a specified period, allowing users to track their skill progression.
- **Stats Over Time (LineChart)**: Provides a graphical overview of various gameplay statistics over time, including Wins, Losses, and Draws, aiding in performance analysis and trend identification.

# Admin Dashboard

## Games

### Queue

The Queue section of the Admin Dashboard displays the following information for users currently in the matchmaking queue:

- **Profile Image**: Displays the Profile Image.
- **Username**: Unique identifier for each user.
- **ELO**: ELO rating, indicating the user's skill level in the game.

### Current Matches

In the Current Matches section, active game sessions are listed, showing details for both you and your opponent:

- **Your Details**: Profile Image, Username, and ELO of the admin user.
- **Enemy Details**: Profile Image, Username, and ELO of the opponent.
- **Player Who Started**: Indicates which player initiated the current match.

## Profiles

The Profiles section provides an overview of user profiles with the following details:

- **Profile Image**: Displays the Profile Image.
- **Username**: Unique identifier for each user.
- **ELO**: ELO rating, indicating the user's skill level in the game.

For each user listed in the Profiles section, administrators can click on the username to view the full profile information.

# TicTacToe Game

In the TicTacToe Game, users can engage in gameplay interactions with opponents, view game-related information, and communicate through chat.

- **Your Details**: Displayed information about the admin user participating in the TicTacToe game, including the following:
  - **Profile Image**: Displays the Profile Image.
  - **Username**: Unique identifier for the admin user.
  - **ELO**: ELO rating, representing the admin user's skill level in the TicTacToe game.

- **Enemy Details**: Provides details about the opponent in the TicTacToe game, including the following:
  - **Profile Image**: Displays the Profile Image.
  - **Username**: Unique identifier for the opponent.
  - **ELO**: ELO rating of the opponent, indicating their skill level in the TicTacToe game.

## Game Mechanics

The Game Mechanics section provides essential details about the ongoing TicTacToe game session, including:
- **Board**: Visual representation of the TicTacToe game environment, displaying the current game state.
- **Set Pieces**: Management of game elements such as X's and O's on the TicTacToe game board.
- **Whose Turn**: Indicates whose turn it is during the TicTacToe gameplay, allowing users to track the flow of the game.

## Chat

The Chat feature enables users to communicate with each other during the TicTacToe gameplay, with timestamps provided for message tracking and reference.



# NavBar

## Profile
Navigates to the user's profile if they are signed in.

## Admin 
Navigates to the admin dashboard if the user is signed in as an administrator.

## Theme
Allows the user to change the theme to either Dark or Light.

## Auth
Provides options for authentication, including signing in and signing up.

### Sign In
- Username
- Password (show/hide toggle)
- Information about the account

### Sign Up
- Username
- Password (show/hide toggle)
- Confirm Password (show/hide toggle)
- Information about the necessity of a unique username and password matching conventions.

## Logout
Logs the user out of the current session.