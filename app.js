<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>⚡ Smart Support - AI Ticket System</title>
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Papa Parse -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            background: #f8fafc;
            min-height: 100vh;
            padding: 40px 20px;
            color: #1e293b;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
        }

        /* Header */
        .header {
            text-align: center;
            margin-bottom: 40px;
        }

        h1 {
            font-size: 2.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }

        .subtitle {
            color: #64748b;
            font-size: 1.1rem;
        }

        /* Status Bar */
        .status-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: white;
            padding: 15px 25px;
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            margin-bottom: 25px;
        }

        .status {
            color: #64748b;
            font-size: 0.95rem;
        }

        .status i {
            margin-right: 8px;
            color: #667eea;
        }

        .badge {
            background: #e2e8f0;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
            color: #475569;
        }

        /* Error Message */
        .error {
            display: none;
            background: #fee2e2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 15px 20px;
            border-radius: 10px;
            margin-bottom: 25px;
            font-size: 0.95rem;
        }

        .error i {
            margin-right: 8px;
        }

        /* Main Card */
        .card {
            background: white;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.08);
            overflow: hidden;
        }

        .card-header {
            padding: 25px 30px;
            border-bottom: 1px solid #e2e8f0;
            background: #f8fafc;
        }

        .card-header h2 {
            font-size: 1.3rem;
            font-weight: 600;
            color: #1e293b;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .card-header h2 i {
            color: #667eea;
        }

        .card-body {
            padding: 30px;
        }

        /* Analyze Button */
        .analyze-btn {
            width: 100%;
            padding: 18px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 14px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-bottom: 25px;
        }

        .analyze-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }

        .analyze-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        /* Loading */
        .loading {
            display: none;
            text-align: center;
            padding: 30px;
        }

        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e2e8f0;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* Review Box */
        .review-container {
            background: #f8fafc;
            border-radius: 16px;
            padding: 25px;
            margin-bottom: 25px;
            border: 1px solid #e2e8f0;
        }

        .review-label {
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
            margin-bottom: 10px;
        }

        #reviewText {
            font-size: 1.1rem;
            line-height: 1.6;
            color: #1e293b;
            min-height: 80px;
        }

        #reviewText:empty:before {
            content: "Click analyze to read a customer review...";
            color: #94a3b8;
            font-style: italic;
        }

        /* Sentiment Result */
        .sentiment-result {
            background: #f8fafc;
            border-radius: 16px;
            padding: 25px;
            margin-bottom: 25px;
            border: 1px solid #e2e8f0;
            display: none;
        }

        .sentiment-header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 15px;
        }

        #resultIcon {
            font-size: 40px;
        }

        #resultLabel {
            font-size: 1.5rem;
            font-weight: 700;
        }

        .confidence-bar {
            width: 100%;
            height: 8px;
            background: #e2e8f0;
            border-radius: 4px;
            margin-top: 15px;
            overflow: hidden;
        }

        .confidence-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            border-radius: 4px;
            transition: width 0.5s ease;
        }

        #resultConfidence {
            margin-top: 10px;
            font-size: 0.9rem;
            color: #64748b;
        }

        /* Action Box - Ticket System */
        .ticket-box {
            display: none;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid;
            margin-top: 25px;
        }

        .ticket-header {
            padding: 20px 25px;
            background: white;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .priority-icon {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
        }

        .ticket-title {
            flex: 1;
        }

        .ticket-title h3 {
            font-size: 1.2rem;
            font-weight: 700;
            margin-bottom: 4px;
        }

        .ticket-title p {
            font-size: 0.9rem;
            color: #64748b;
        }

        .priority-badge {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 700;
            text-transform: uppercase;
        }

        .ticket-body {
            padding: 25px;
            background: #f8fafc;
        }

        .ticket-message {
            font-size: 1.1rem;
            font-weight: 500;
            margin-bottom: 20px;
            line-height: 1.5;
        }

        .ticket-actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }

        .ticket-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            background: white;
            border: 1px solid #e2e8f0;
            color: #1e293b;
            flex: 1;
            justify-content: center;
        }

        .ticket-btn.primary {
            background: #667eea;
            color: white;
            border: none;
        }

        .ticket-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .ticket-footer {
            padding: 15px 25px;
            background: white;
            border-top: 1px solid #e2e8f0;
            font-size: 0.85rem;
            color: #64748b;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .ticket-id {
            font-family: monospace;
            background: #f1f5f9;
            padding: 4px 8px;
            border-radius: 6px;
        }

        /* Priority Colors */
        .priority-critical { border-color: #ef4444; }
        .priority-critical .priority-icon { background: #fee2e2; color: #ef4444; }
        .priority-critical .priority-badge { background: #ef4444; color: white; }

        .priority-medium { border-color: #f59e0b; }
        .priority-medium .priority-icon { background: #fef3c7; color: #f59e0b; }
        .priority-medium .priority-badge { background: #f59e0b; color: white; }

        .priority-low { border-color: #10b981; }
        .priority-low .priority-icon { background: #d1fae5; color: #10b981; }
        .priority-low .priority-badge { background: #10b981; color: white; }

        /* Footer */
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #94a3b8;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚡ Smart Support System</h1>
            <div class="subtitle">AI-powered customer service automation</div>
        </div>

        <div class="status-bar">
            <div class="status">
                <i class="fas fa-circle" style="color: #10b981;"></i>
                <span id="statusMessage">Initializing system...</span>
            </div>
            <div class="badge">
                <i class="fas fa-ticket-alt"></i> Auto-ticketing
            </div>
        </div>

        <div id="errorMessage" class="error">
            <i class="fas fa-exclamation-triangle"></i>
            <span></span>
        </div>

        <div class="card">
            <div class="card-header">
                <h2>
                    <i class="fas fa-robot"></i>
                    Customer Review Analyzer
                </h2>
            </div>
            
            <div class="card-body">
                <button id="analyzeButton" class="analyze-btn" disabled>
                    <i class="fas fa-magic"></i>
                    Analyze Next Review
                </button>

                <div id="loadingSpinner" class="loading">
                    <div class="spinner"></div>
                    <div style="color: #64748b;">Analyzing sentiment...</div>
                </div>

                <div class="review-container">
                    <div class="review-label">
                        <i class="far fa-comment"></i> CUSTOMER REVIEW
                    </div>
                    <div id="reviewText"></div>
                </div>

                <div id="resultBox" class="sentiment-result">
                    <div class="sentiment-header">
                        <div id="resultIcon"></div>
                        <div id="resultLabel"></div>
                    </div>
                    <div class="confidence-bar">
                        <div id="confidenceFill" class="confidence-fill" style="width: 0%"></div>
                    </div>
                    <div id="resultConfidence"></div>
                </div>

                <!-- Ticket System Result -->
                <div id="ticketBox" class="ticket-box">
                    <div class="ticket-header">
                        <div class="priority-icon">
                            <i class="fas fa-ticket-alt"></i>
                        </div>
                        <div class="ticket-title">
                            <h3 id="ticketTitle">Support Ticket</h3>
                            <p id="ticketSubtitle"></p>
                        </div>
                        <div id="ticketBadge" class="priority-badge"></div>
                    </div>
                    
                    <div class="ticket-body">
                        <div id="ticketMessage" class="ticket-message"></div>
                        <div class="ticket-actions">
                            <button id="ticketActionBtn" class="ticket-btn primary">
                                <i class="fas fa-bolt"></i>
                                <span></span>
                            </button>
                            <button id="ticketSecondaryBtn" class="ticket-btn">
                                <i class="far fa-clock"></i>
                                Remind Later
                            </button>
                        </div>
                    </div>
                    
                    <div class="ticket-footer">
                        <i class="fas fa-hashtag"></i>
                        <span class="ticket-id" id="ticketId">TICKET_GEN_123</span>
                        <span style="flex: 1; text-align: right;" id="ticketTimestamp"></span>
                    </div>
                </div>
            </div>
        </div>

        <div class="footer">
            <i class="fas fa-shield-alt"></i> Automated support system • Priority based on sentiment
        </div>
    </div>

    <script type="module" src="app.js"></script>
</body>
</html>
