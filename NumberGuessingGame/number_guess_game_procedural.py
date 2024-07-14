import random

# Initialize game settings
lower_bound = 1
upper_bound = 100
max_attempts = 10

# Initialize game state
target_number = random.randint(lower_bound, upper_bound)
attempts = 0
guessed_correctly = False

print("Welcome to the Number Guessing Game!")
print(f"I'm thinking of a number between {lower_bound} and {upper_bound}.")
print(f"You have {max_attempts} attempts to guess it.")

# Game loop
while not guessed_correctly and attempts < max_attempts:
    try:
        guess = int(input("Enter your guess: "))
        if guess < lower_bound or guess > upper_bound:
            print(f"Please enter a number between {lower_bound} and {upper_bound}.")
            continue
        
        attempts += 1
        if guess < target_number:
            print("Your guess is too low.")
        elif guess > target_number:
            print("Your guess is too high.")
        else:
            guessed_correctly = True
            print("Congratulations! You've guessed the number!")
    except ValueError:
        print("Invalid input. Please enter a valid integer.")

if not guessed_correctly:
    print(f"Sorry, you've used all your attempts. The number was {target_number}.")
