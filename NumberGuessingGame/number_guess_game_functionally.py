import random

def initialize_game(lower_bound=1, upper_bound=100, max_attempts=10):
    """Initialize the game with default or provided settings."""
    return {
        'lower_bound': lower_bound,
        'upper_bound': upper_bound,
        'max_attempts': max_attempts,
        'target_number': random.randint(lower_bound, upper_bound),
        'attempts': 0,
        'guessed_correctly': False
    }

def make_guess(game_state, guess):
    """Make a guess and update the game state."""
    game_state['attempts'] += 1
    if guess < game_state['target_number']:
        return "Your guess is too low."
    elif guess > game_state['target_number']:
        return "Your guess is too high."
    
    game_state['guessed_correctly'] = True
    return "Congratulations! You've guessed the number!"

def is_game_over(game_state):
    """Check if the game is over."""
    return game_state['guessed_correctly'] or game_state['attempts'] >= game_state['max_attempts']

def play_game():
    """Play the Number Guessing Game."""
    game_state = initialize_game()
    print(f"Welcome to the Number Guessing Game!")
    print(f"I'm thinking of a number between {game_state['lower_bound']} and {game_state['upper_bound']}.")
    print(f"You have {game_state['max_attempts']} attempts to guess it.")
    
    while not is_game_over(game_state):
        try:
            guess = int(input("Enter your guess: "))
            if guess < game_state['lower_bound'] or guess > game_state['upper_bound']:
                print(f"Please enter a number between {game_state['lower_bound']} and {game_state['upper_bound']}.")
                continue
            feedback = make_guess(game_state, guess)
            print(feedback)
        except ValueError:
            print("Invalid input. Please enter a valid integer.")
    
    if not game_state['guessed_correctly']:
        print(f"Sorry, you've used all your attempts. The number was {game_state['target_number']}.")

if __name__ == "__main__":
    play_game()
    play_game()
