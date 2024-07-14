import random

class NumberGuessingGame:
    def __init__(self, lower_bound=1, upper_bound=100, max_attempts=10):
        self.lower_bound = lower_bound
        self.upper_bound = upper_bound
        self.max_attempts = max_attempts
        self.target_number = random.randint(lower_bound, upper_bound)
        self.attempts = 0
        self.guessed_correctly = False

    @property
    def get_remaining_attempts(self):
        return self.max_attempts - self.attempts

    def make_guess(self, guess):
        self.attempts += 1
        if guess < self.target_number:
            return f"Your guess is too low. Your Remaining Attempts: {self.get_remaining_attempts}"
        elif guess > self.target_number:
            return f"Your guess is too high. Your Remaining Attempts: {self.get_remaining_attempts}"
        
        self.guessed_correctly = True
        return "Congratulations! You've guessed the number!"
    
    def is_game_over(self):
        return self.guessed_correctly or self.attempts >= self.max_attempts

    def play(self):
        print(f"Welcome to the Number Guessing Game!")
        print(f"I'm thinking of a number between {self.lower_bound} and {self.upper_bound}.")
        print(f"You have {self.max_attempts} attempts to guess it.")

        while not self.is_game_over():
            try:
                guess = int(input("Enter your guess: "))
                if guess < self.lower_bound or guess > self.upper_bound:
                    print(f"Please enter a number between {self.lower_bound} and {self.upper_bound}.")
                    continue
                feedback = self.make_guess(guess)
                print(feedback)
            except ValueError:
                print("Invalid input. Please enter a valid integer.")

        if not self.guessed_correctly:
            print(f"Sorry, you've used all your attempts. The number was {self.target_number}.")

if __name__ == "__main__":
    game = NumberGuessingGame()
    game.play()
