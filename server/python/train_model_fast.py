#!/usr/bin/env python3
"""
Fast Batch Training for TensorFlow-style Neural Network
Uses vectorized operations for efficient training
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from tensorflow_field_model import NeuralFieldEmbedding
import numpy as np

def generate_training_batches():
    """Generate demographic training pairs"""
    
    # Definitive demographic field pairs (ground truth)
    similar_pairs = [
        # SSN variations
        ('ssn', 'social_security_number'), ('ssn', 'SSN'), ('ssn', 'tax_id'),
        ('socialSecurityNumber', 'social_security_number'),
        
        # Name variations
        ('firstName', 'first_name'), ('firstName', 'given_name'), ('firstName', 'fname'),
        ('lastName', 'last_name'), ('lastName', 'surname'), ('lastName', 'lname'),
        ('fullName', 'full_name'), ('embossedName', 'embossed_name'),
        
        # DOB variations
        ('dob', 'dateOfBirth'), ('dob', 'date_of_birth'), ('dob', 'birthDate'),
        ('dateOfBirth', 'date_of_birth'), ('birthDate', 'birth_date'),
        
        # Email variations
        ('email', 'emailAddress'), ('email', 'email_address'), ('email', 'e_mail'),
        ('emailAddress', 'email_address'),
        
        # Phone variations
        ('phone', 'phoneNumber'), ('phone', 'phone_number'), ('phone', 'telephone'),
        ('mobileNumber', 'mobile_number'), ('cellPhone', 'cell_phone'),
        
        # Address variations
        ('address', 'streetAddress'), ('address', 'street_address'),
        ('city', 'cityName'), ('city', 'city_name'),
        ('state', 'stateCode'), ('state', 'state_code'),
        ('zip', 'zipCode'), ('zip', 'postal_code'), ('zipCode', 'postalCode'),
        
        # Account variations
        ('accountNumber', 'account_number'), ('accountId', 'account_id'),
        ('cardNumber', 'card_number'), ('cardNumber', 'creditCardNumber'),
        
        # Other demographic
        ('gender', 'sex'), ('race', 'ethnicity'),
        ('income', 'salary'), ('income', 'annualIncome'),
    ]
    
    # Dissimilar pairs (different categories)
    dissimilar_pairs = [
        ('firstName', 'accountNumber'), ('firstName', 'transactionId'),
        ('ssn', 'orderId'), ('ssn', 'productCode'),
        ('email', 'statusCode'), ('email', 'quantity'),
        ('dob', 'createdDate'), ('dob', 'price'),
        ('phone', 'itemNumber'), ('phone', 'version'),
    ]
    
    return similar_pairs, dissimilar_pairs


def train_with_batches():
    """Train model using efficient batch operations"""
    print("=" * 60)
    print("Fast Batch Training - TensorFlow-style Neural Network")
    print("=" * 60)
    print()
    
    # Generate training data
    print("Generating training pairs...")
    similar_pairs, dissimilar_pairs = generate_training_batches()
    print(f"Similar pairs: {len(similar_pairs)}")
    print(f"Dissimilar pairs: {len(dissimilar_pairs)}")
    print()
    
    # Initialize model
    model = NeuralFieldEmbedding(input_dim=100, embedding_dim=32)
    print("Model initialized")
    print()
    
    # Train with fewer epochs for speed
    print("Training model (10 epochs with high learning rate)...")
    model.train_on_pairs(
        similar_pairs=similar_pairs,
        dissimilar_pairs=dissimilar_pairs,
        epochs=10,
        learning_rate=0.05
    )
    print()
    
    # Test critical pairs
    print("Testing critical demographic pairs:")
    print("-" * 60)
    critical_tests = [
        ('ssn', 'social_security_number'),
        ('firstName', 'first_name'),
        ('dob', 'dateOfBirth'),
        ('email', 'emailAddress'),
        ('phone', 'phoneNumber'),
    ]
    
    all_pass = True
    for field1, field2 in critical_tests:
        sim = model.calculate_similarity(field1, field2)
        status = "✓ PASS" if sim > 0.85 else "✗ FAIL"
        if sim <= 0.85:
            all_pass = False
        print(f"{field1:30s} <-> {field2:30s} = {sim:.3f} {status}")
    
    print()
    
    if not all_pass:
        print("⚠ Warning: Some critical pairs below threshold. Consider more training.")
    else:
        print("✓ All critical pairs above 0.85 threshold!")
    
    # Save model
    print()
    model_dir = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, 'demographic_field_model.pkl')
    model.save_model(model_path)
    
    print()
    print("=" * 60)
    print("✓ Training complete and model saved!")
    print("=" * 60)


if __name__ == "__main__":
    train_with_batches()
