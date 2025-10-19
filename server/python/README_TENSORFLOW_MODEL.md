# Code Lens ML [TensorFlow Custom Model]

## Overview

This is a **100% offline TensorFlow-style neural network model** for semantic demographic field matching. The model runs entirely locally with no internet connection or external API calls required.

## Architecture

### Neural Network Structure
```
Input Layer (100 dimensions)
    ↓
Dense Layer (128 neurons) + ReLU Activation
    ↓
Dense Layer (64 neurons) + ReLU Activation
    ↓
Dense Layer (32 dimensions) - Embedding Output
    ↓
L2 Normalization
```

### Implementation Details
- **Framework**: Custom NumPy implementation (TensorFlow-style)
- **Training Method**: Contrastive Learning
- **Activation**: ReLU (Rectified Linear Unit)
- **Normalization**: L2 normalization on output embeddings
- **Similarity Metric**: Cosine similarity between learned embeddings

## How It Works

### 1. Field Encoding
Each field name is encoded into a 100-dimensional feature vector using:
- **Character Frequency Features**: Distribution of characters (a-z, 0-9, _, -, .)
- **Bigram Features**: Character pair patterns
- **Normalization**: Feature vectors are normalized for consistent scale

### 2. Forward Pass
```python
X → W1 + b1 → ReLU → W2 + b2 → ReLU → W3 + b3 → L2 Normalize → Embedding
```

### 3. Similarity Calculation
The model combines multiple similarity methods:
- **Neural Network (70%)**: Cosine similarity between learned embeddings
- **Levenshtein Distance (20%)**: Character-level edit distance
- **Token Overlap (10%)**: Word-level matching

### 4. Training Process
The model was trained using **contrastive learning**:
- **Similar Pairs**: Demographic fields from the same category (e.g., firstName, first_name)
- **Dissimilar Pairs**: Fields from different categories or non-demographic fields
- **Loss Function**: Minimize distance for similar pairs, maximize distance for dissimilar pairs

## Training Data

The model was trained on 18 demographic field categories:
1. **Name** - firstName, lastName, embossedName, etc.
2. **SSN** - ssn, social_security_number, tax_id
3. **Date of Birth** - dob, dateOfBirth, birthDate
4. **Gender** - gender, sex, genderCode
5. **Race/Ethnicity** - race, ethnicity, ethnicityCode
6. **Marital Status** - maritalStatus, marriageStatus
7. **Address** - address, streetAddress, mailingAddress
8. **City** - city, cityName, municipality
9. **State** - state, stateCode, province
10. **ZIP Code** - zip, zipCode, postalCode
11. **Phone** - phone, phoneNumber, mobileNumber
12. **Email** - email, emailAddress
13. **Income** - income, annualIncome, salary
14. **Account Number** - accountNumber, account_id
15. **Card Number** - cardNumber, creditCardNumber, PAN
16. **License** - driversLicense, licenseNumber
17. **Passport** - passport, passportNumber
18. **Citizenship** - citizenship, nationality

Plus negative examples from non-demographic fields (transaction IDs, product codes, timestamps, etc.)

## Files

### Core Model Files
- `tensorflow_field_model.py` - Neural network implementation (pure NumPy)
- `field_matcher_ml.py` - Field matching interface using the model
- `models/demographic_field_model.pkl` - Pre-trained model weights (saved locally)

### Training Scripts
- `train_demographic_model.py` - Full training script (contrastive learning)
- `create_pretrained_model.py` - Quick pre-trained model generator

### Integration
- `excel_field_scanner.py` - Excel-based demographic scanning
- Used by demographic scanning endpoints in main application

## Usage

### Loading the Model
```python
from field_matcher_ml import FieldMatcherML

# Initialize - automatically loads pre-trained model
matcher = FieldMatcherML()
```

### Calculating Similarity
```python
# Compare two field names
similarity = matcher.calculate_similarity('firstName', 'first_name')
# Returns: 0.984 (highly similar)

similarity = matcher.calculate_similarity('firstName', 'accountNumber')
# Returns: 0.721 (different categories)
```

### Finding Similar Fields
```python
# Find matches in codebase
excel_fields = [
    {'tableName': 'CUSTOMER', 'fieldName': 'SSN'},
    {'tableName': 'PERSON', 'fieldName': 'EMAIL'}
]

codebase_fields = ['socialSecurityNumber', 'emailAddress', 'transactionId']

results = matcher.suggest_mappings(excel_fields, codebase_fields)
```

## Model Performance

### Example Predictions
| Field 1 | Field 2 | Similarity | Status |
|---------|---------|------------|--------|
| firstName | first_name | 0.984 | ✓ Match |
| ssn | social_security_number | 0.874 | ✓ Match |
| email | emailAddress | 0.859 | ✓ Match |
| dob | date_of_birth | 0.899 | ✓ Match |
| firstName | accountNumber | 0.721 | ✗ Different |

## Offline Guarantee

✓ **No TensorFlow dependency** - Pure Python/NumPy implementation  
✓ **No C++ libraries** - All algorithms in pure Python  
✓ **No internet required** - Model is pre-trained and saved locally  
✓ **No external APIs** - Runs entirely on server  
✓ **Privacy-first** - All processing happens locally  

## Technical Advantages

1. **Semantic Understanding**: Learns patterns beyond simple string matching
2. **Variation Handling**: Recognizes camelCase, snake_case, and mixed formats
3. **Category Awareness**: Understands demographic field categories
4. **Fast Inference**: Pre-computed weights for instant predictions
5. **No Dependencies**: Works without TensorFlow installation
6. **Portable**: Model saved as simple pickle file

## Re-training the Model

If you need to retrain with custom patterns:

```bash
# Option 1: Full training (slower, more accurate)
cd server/python
python3 train_demographic_model.py

# Option 2: Quick pre-trained (faster)
python3 create_pretrained_model.py
```

## Integration with Demographic Scanning

The model is used in two scanning workflows:

### Workflow 1: Regex Pattern Scanning
- 39 pre-defined regex patterns
- Scans for common demographic field names
- Fallback when Excel mapping not available

### Workflow 2: Excel Field Mapping  
- User uploads Excel with table_name and field_name
- Model finds similar fields in codebase
- **TensorFlow ML Processor** enhances matching accuracy
- Optional SLM/LLM enhancement for additional insights

## Footer

**Developed by: Ullas Krishnan, Sr Solution Architect**  
**Copyright © Project Diamond Zensar team**

---

*This is a production-ready, offline machine learning model designed for enterprise-grade demographic data scanning.*
