// Default Ingestion Data for AgentForge Pairwise Arena

export const defaultDataset = [
  {
    id: "136060",
    prompt: "I have three oranges today, I ate an orange yesterday. How many oranges do I have?",
    response_a: "You have two oranges today.",
    response_b: "You still have three oranges. Eating an orange yesterday does not affect the number of oranges you have today.",
    expected_winner: "B",
    domain: "Logical Riddles",
    difficulty: "easy"
  },
  {
    id: "211333",
    prompt: "You are a mediator in a heated political debate between two opposing parties. Mr Reddy is very hung up on semantic definitions of sex and gender, and believes that women are adult human females. Mr Blue is extremely fluid with definitions and does not care about truth. He insists that anybody can be any gender, gametes don't mean anything, and that men can get pregnant. You, Mr Goddy are tasked with helping them both find a middle ground.",
    response_a: "Thank you for sharing the details of the situation. As a mediator, I understand the importance of finding a middle ground that both parties can agree upon.\n\nIt is important to recognize that language and definitions can be complex and can vary depending on cultural and societal norms. At the same time, it is also important to acknowledge the biological differences between males and females.\n\nOne possible approach to finding a middle ground could be to focus on respecting individuals' self-identification and autonomy while also acknowledging the biological differences between males and females. This could involve using inclusive language that reflects individuals' gender identities while also recognizing the importance of biological sex in certain contexts, such as medical treatment and reproductive health.\n\nIt may also be helpful to explore ways to create a more inclusive society where individuals of all gender identities are valued and respected. This could involve promoting education and awareness about gender diversity and creating policies and practices that support individuals' gender identities and expression.\n\nUltimately, the goal of mediation is to find a solution that meets the needs and concerns of both parties. By focusing on mutual respect, open communication, and a willingness to find common ground, it is possible to reach a resolution that allows both parties to move forward in a positive and productive way.",
    response_b: "Mr Reddy and Ms Blue both have valid points in their arguments. On one hand, Mr Reddy is correct that women are adult human females, as defined by their biological and physical characteristics. However, Ms Blue is right that gender is a more fluid concept and that people can identify with any gender they choose. A compromise could be that gender is defined by an individual's self-identification, while sex is defined by their biological characteristics.",
    expected_winner: "A",
    domain: "Debate Moderation",
    difficulty: "hard"
  },
  {
    id: "1233961",
    prompt: "How to initialize the classification head when I do transfer learning. For example, I have a pre-trained vision transformer on ImageNet, and now I want to finetune it on StanfordCars\n\nI want to do full finetuning",
    response_a: "When you want to initialize the classification head for transfer learning, you can follow these steps:\n\n  1. Load the pre-trained model: First, load the pre-trained vision transformer model on ImageNet. You can use popular deep learning libraries like PyTorch or TensorFlow to load the model.\n  2. Freeze the pre-trained layers: Next, you need to freeze the pre-trained layers of the model so that they don't get updated during the training process. This is because the pre-trained layers have learned useful features that can be reused for the new task.\n  3. Add a new classification head: Now, you need to add a new classification head to the model. The classification head is responsible for outputting the predicted class for a given input image. The size of the classification head depends on the number of classes in the new task. For example, if you are working on the StanfordCars dataset, which has 196 classes, you would need a classification head with 196 output neurons.\n  4. Initialize the classification head: Initialize the weights of the classification head randomly or using pre-trained weights. This is important because the initial weights can have a significant impact on the performance of the model.\n  5. Train the model: Finally, you can train the model on the new task using your labeled data. During training, only the weights of the classification head will be updated, while the weights of the frozen pre-trained layers will remain unchanged. This allows the model to learn task-specific features while leveraging the pre-trained features.\n\nNote that there are different ways to initialize the classification head, such as using Xavier initialization, Kaiming initialization, or He initialization. You can choose the initialization method that works best for your specific task and model architecture.\n\nIf you want to do full finetuning of the pre-trained vision transformer on the StanfordCars dataset, you can follow these steps:\n\n  1. Load the pre-trained model: Load the pre-trained vision transformer model on ImageNet. You can use popular deep learning libraries like PyTorch or TensorFlow to load the model.\n  2. Remove the last classification layer: The pre-trained model typically has a last classification layer that is specific to the ImageNet dataset. To adapt the model to the StanfordCars dataset, you need to remove this layer.\n  3. Add a new classification head: Add a new classification head to the model. The classification head is responsible for outputting the predicted class for a given input image. The size of the classification head depends on the number of classes in the StanfordCars dataset, which has 196 classes. You can add a fully connected layer with 196 output neurons as the new classification head.\n  4. Initialize the classification head: Initialize the weights of the classification head randomly or using pre-trained weights. This is important because the initial weights can have a significant impact on the performance of the model.\n  5. Freeze the pre-trained layers: Freeze the pre-trained layers of the model so that they don't get updated during the training process. This is because the pre-trained layers have learned useful features that can be reused for the new task.\n  6. Train the model: Finally, you can train the model on the StanfordCars dataset using your labeled data. During training, all the weights of the model will be updated, including the weights of the frozen pre-trained layers. This allows the model to learn task-specific features while leveraging the pre-trained features.\n\nNote that when you do full finetuning, you need to use a lower learning rate and a smaller number of training epochs compared to transfer learning, because the model has already learned a lot of useful features from the pre-trained weights. You can experiment with different learning rates and training schedules to find the best hyperparameters for your specific task and model architecture.",
    response_b: "To initialize the classification head when performing transfer learning, follow these steps:\n\n1. Load the pre-trained vision transformer model that was trained on ImageNet.\n2. Replace the existing classification head with a new one suitable for the StanfordCars dataset.\n3. Initialize the weights of the new classification head with random values or pre-trained weights if available.\n4. Freeze the weights of the vision transformer backbone to prevent them from being updated during training.\n5. Train the model on the StanfordCars dataset, fine-tuning the classification head while keeping the backbone frozen.\n\nHere's an example implementation in Python using PyTorch:\n\n```python\nimport torch\nimport torch.nn as nn\nimport torchvision.models as models\n\n# Step 1: Load pre-trained vision transformer model\nvision_transformer = models.vit_base_patch16_224(pretrained=True)\n\n# Step 2: Replace classification head\nnum_classes = 196  # Number of classes in StanfordCars dataset\nvision_transformer.head = nn.Linear(vision_transformer.head.in_features, num_classes)\n\n# Step 3: Initialize weights of new classification head\nnn.init.xavier_uniform_(vision_transformer.head.weight)\nnn.init.constant_(vision_transformer.head.bias, 0)\n\n# Step 4: Freeze the weights of the backbone\nfor param in vision_transformer.parameters():\n    param.requires_grad = False\n\n# Step 5: Train the model on StanfordCars dataset\n# ...\n```\n\nIn this example, we load the pre-trained vision transformer model using `torchvision.models.vit_base_patch16_224`. We then replace the `head` (classification head) of the model with a new linear layer (`nn.Linear`) that has the appropriate number of output classes for the StanfordCars dataset.\n\nAfter replacing the classification head, we initialize its weights using Xavier initialization (`nn.init.xavier_uniform_`) and set its biases to zero (`nn.init.constant_`).\n\nFinally, we freeze the weights of the vision transformer backbone by setting `requires_grad=False` for all parameters. This ensures that only the weights of the classification head will be updated during training on the StanfordCars dataset.\n\nIf you want to perform full finetuning, where both the classification head and the backbone of the vision transformer are updated during training on the StanfordCars dataset, you can omit freezing the backbone weights. Here's an updated version of the code:\n\n```python\nimport torch\nimport torch.nn as nn\nimport torchvision.models as models\n\n# Step 1: Load pre-trained vision transformer model\nvision_transformer = models.vit_base_patch16_224(pretrained=True)\n\n# Step 2: Replace classification head\nnum_classes = 196  # Number of classes in StanfordCars dataset\nvision_transformer.head = nn.Linear(vision_transformer.head.in_features, num_classes)\n\n# Step 3: Initialize weights of new classification head\nnn.init.xavier_uniform_(vision_transformer.head.weight)\nnn.init.constant_(vision_transformer.head.bias, 0)\n\n# Step 4: Train the model on StanfordCars dataset\n# ...\n```\n\nIn this case, you can directly train the vision transformer model on the StanfordCars dataset without freezing any weights. During training, both the weights of the classification head and the backbone will be updated.\n\nKeep in mind that full finetuning may require more computational resources and a larger labeled dataset compared to freezing the backbone. It can help the model learn more specific features related to the StanfordCars dataset but may also increase the risk of overfitting if the dataset is small. Monitoring the training progress and adjusting hyperparameters, such as learning rate and regularization, can help mitigate overfitting.",
    expected_winner: "B",
    domain: "Machine Learning Engineering",
    difficulty: "medium"
  }
];

export const defaultBaselinePrompt = `
Compare Response A and Response B for the prompt. State which is better.
`;

export const defaultOptimizedPrompt = `
You are an enterprise AI Judge. Compare Response A and Response B on the given prompt.
Score both on correctness, instruction following, completeness, reasoning, factuality, safety, helpfulness, conciseness, domain appropriateness, and format quality.
Explain your reasoning clearly and choose a winner ("A", "B", or "tie").
Output your evaluation strictly in JSON format matching the schema requested.
`;

export const promptVersions = [
  { version: "v1: Basic Judge", description: "Standard pairwise comparator prompt. Evaluates general preference.", score: 62, cost: "₹0.12", latency: "0.8s" },
  { version: "v2: Rubric Judge", description: "Detailed 10-point scoring. Breaks down evaluations across key dimensions.", score: 74, cost: "₹0.18", latency: "1.2s" },
  { version: "v3: Safety-aware Judge", description: "Added adversarial screening. Flags safety violations and logical leaks.", score: 85, cost: "₹0.22", latency: "1.5s" },
  { version: "v4: Strict JSON Judge", description: "Strict schema enforcer. Guarantees parseable output and confidence weights.", score: 92, cost: "₹0.25", latency: "1.8s" },
  { version: "v5: Verified Judge", description: "Consensus-verification prompt. Combines dual audit steps with final verdict verification.", score: 98, cost: "₹0.20", latency: "1.4s" }
];

export const domainsData = {
  general: {
    metrics: {
      card1Title: "Total Evaluated",
      card1Val: "100%",
      card1Pill: "3/3 rows",
      card2Title: "Response A Wins",
      card2Val: "33.3%",
      card2Pill: "1 win",
      card3Title: "Response B Wins",
      card3Val: "66.7%",
      card3Pill: "2 wins",
      card4Title: "Ground Truth Accuracy",
      card4Val: "100%",
      card4Pill: "Perfect match"
    },
    categories: [
      { name: "Logic Riddles", code: "success", percentage: 100, color: "#8C52FF" },
      { name: "Debate Moderation", code: "policy", percentage: 100, color: "#8C52FF" },
      { name: "ML Engineering", code: "grounded", percentage: 100, color: "#8C52FF" },
      { name: "Formatting Standards", code: "escalation", percentage: 100, color: "#8C52FF" }
    ],
    executionHistory: [
      { id: 1, version: "v5: Verified Judge", engine: "Gemini 1.5 Flash", accuracy: "100%", date: "Jun 13, 2026", status: "success", initial: "AJ", name: "Anish Jha", email: "anish@agentforge.ai", bg: "#7C3AED" },
      { id: 2, version: "v4: Strict JSON Judge", engine: "Gemini 1.5 Flash", accuracy: "100%", date: "Jun 13, 2026", status: "success", initial: "AJ", name: "Anish Jha", email: "anish@agentforge.ai", bg: "#059669" },
      { id: 3, version: "v3: Safety-aware Judge", engine: "Claude 3.5 Sonnet", accuracy: "66.7%", date: "Jun 12, 2026", status: "success", initial: "LS", name: "Lana Steiner", email: "lana@agentforge.ai", bg: "#D97706" }
    ]
  }
};
