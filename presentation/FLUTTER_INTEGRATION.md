# Flutter Integration Guide for GenerationRemoteApp

## Overview

The `GenerationRemoteApp` component is designed to be embedded in Flutter applications via WebView to display real-time presentation generation with streaming slides. It handles authentication via cookies and provides bidirectional communication between Flutter and the Vue application.

## URL Route

```
/generation
```

Access the component at: `https://your-domain.com/generation`

### URL Parameters (Optional)

You can customize the handler names by passing query parameters:

```
/generation?onReadyHandler=customReady&onStartedHandler=customStarted&onCompletedHandler=customCompleted
```

Or pass them as component props if loading via JavaScript.

## Authentication

The Vue application expects authentication via HTTP-only cookies. Flutter must set the access token cookie when establishing the WebView connection.

### Flutter Cookie Setup Example

```dart
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

Future<void> setupWebViewWithAuth(String accessToken) async {
  final cookieManager = CookieManager.instance();
  
  // Set the access token as an HTTP-only cookie
  await cookieManager.setCookie(
    url: WebUri('https://your-domain.com'),
    name: 'access_token',
    value: accessToken,
    isHttpOnly: true,
    isSecure: true,
    sameSite: HTTPCookieSameSitePolicy.LAX,
  );
}
```

## Data Flow

### 1. Initialize WebView (Flutter)

```dart
InAppWebView(
  initialUrlRequest: URLRequest(
    url: WebUri('https://your-domain.com/generation'),
  ),
  initialSettings: InAppWebViewSettings(
    javaScriptEnabled: true,
    thirdPartyCookiesEnabled: true,
    // Important: Allow mixed content if needed
    mixedContentMode: MixedContentMode.MIXED_CONTENT_ALWAYS_ALLOW,
  ),
  onWebViewCreated: (controller) {
    _webViewController = controller;
    
    // Register handlers for communication
    controller.addJavaScriptHandler(
      handlerName: 'generationViewReady',
      callback: (args) {
        // Vue app is ready, send presentation data
        _sendGenerationData(controller);
      },
    );
    
    controller.addJavaScriptHandler(
      handlerName: 'generationStarted',
      callback: (args) {
        final data = args[0] as Map<String, dynamic>;
        if (data['success'] == true) {
          print('Generation started: ${data['presentationId']}');
        } else {
          print('Generation failed to start: ${data['error']}');
        }
      },
    );
    
    controller.addJavaScriptHandler(
      handlerName: 'generationCompleted',
      callback: (args) {
        final data = args[0] as Map<String, dynamic>;
        if (data['success'] == true) {
          print('Generation completed: ${data['slideCount']} slides');
          // Handle completion
        } else {
          print('Generation failed: ${data['error']}');
          // Handle error
        }
      },
    );
  },
)
```

### 2. Send Presentation Data (Flutter)

```dart
void _sendGenerationData(InAppWebViewController controller) {
  final presentation = {
    'id': 'pres_123456',
    'title': 'My Presentation',
    'slides': [], // Start with empty slides
    'theme': {
      'backgroundColor': '#ffffff',
      'themeColors': ['#4285f4', '#ea4335', '#fbbc04', '#34a853'],
      // ... other theme properties
    },
    'viewport': {
      'width': 1000,
      'height': 562.5,
    },
  };

  final generationRequest = {
    'presentationId': 'pres_123456',
    'outline': 'Introduction to AI\nMachine Learning Basics\n...',
    'model': {
      'name': 'gpt-4',
      'provider': 'openai',
    },
    'slideCount': 10,
    'language': 'en',
    'presentation': {
      'theme': presentation['theme'],
      'viewport': presentation['viewport'],
    },
    'others': {
      'contentLength': 'medium',
      'imageModel': {
        'name': 'dall-e-3',
        'provider': 'openai',
      },
    },
  };

  // Send data to Vue app
  controller.evaluateJavascript(source: '''
    if (window.setGenerationData) {
      window.setGenerationData(
        ${jsonEncode(presentation)},
        ${jsonEncode(generationRequest)}
      );
    }
  ''');
}
```

### 3. Alternative: PostMessage Communication

If you prefer using postMessage instead of direct function calls:

```dart
void _sendGenerationDataViaPostMessage(InAppWebViewController controller) {
  controller.evaluateJavascript(source: '''
    window.postMessage({
      type: 'setGenerationData',
      data: {
        presentation: ${jsonEncode(presentation)},
        generationRequest: ${jsonEncode(generationRequest)}
      }
    }, '*');
  ''');
}
```

## Communication Protocol

### From Vue to Flutter

The Vue app sends these callbacks to Flutter:

#### 1. `generationViewReady`
- **When**: Component is mounted and ready to receive data
- **Payload**: None
- **Action**: Flutter should send presentation data

#### 2. `generationStarted`
- **When**: Generation process has started successfully or failed
- **Payload**: 
  ```typescript
  {
    success: boolean;
    presentationId?: string;  // if success
    error?: string;           // if failure
  }
  ```

#### 3. `generationCompleted`
- **When**: Generation process has finished (success or failure)
- **Payload**:
  ```typescript
  {
    success: boolean;
    slideCount?: number;  // if success
    error?: string;       // if failure
  }
  ```

### From Flutter to Vue

Flutter can send these messages to Vue:

#### 1. `setGenerationData`
- **When**: After `generationViewReady` is received
- **Data**:
  ```typescript
  {
    presentation: Presentation;
    generationRequest: PresentationGenerationRequest;
  }
  ```

## Data Types

### Presentation Type

```typescript
interface Presentation {
  id: string;
  title: string;
  viewport?: {
    width: number;
    height: number;
  };
  theme?: SlideTheme;
  slides?: Slide[];
  isParsed?: boolean;
}
```

### PresentationGenerationRequest Type

```typescript
interface PresentationGenerationRequest {
  presentationId: string;
  outline: string;
  model: {
    name: string;
    provider: string;
  };
  slideCount: number;
  language: string;
  presentation: {
    theme: SlideTheme;
    viewport: {
      width: number;
      height: number;
    };
  };
  others: {
    contentLength: string;
    imageModel: {
      name: string;
      provider: string;
    };
  };
}
```

### SlideTheme Type

```typescript
interface SlideTheme {
  backgroundColor: string;
  themeColors: string[];
  fontName?: string;
  fontColor?: string;
  // ... other theme properties
}
```

## Complete Flutter Example

```dart
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'dart:convert';

class GenerationWebViewScreen extends StatefulWidget {
  final String presentationId;
  final String accessToken;
  final Map<String, dynamic> generationRequest;

  const GenerationWebViewScreen({
    Key? key,
    required this.presentationId,
    required this.accessToken,
    required this.generationRequest,
  }) : super(key: key);

  @override
  State<GenerationWebViewScreen> createState() => _GenerationWebViewScreenState();
}

class _GenerationWebViewScreenState extends State<GenerationWebViewScreen> {
  InAppWebViewController? _webViewController;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _setupCookies();
  }

  Future<void> _setupCookies() async {
    final cookieManager = CookieManager.instance();
    await cookieManager.setCookie(
      url: WebUri('https://your-domain.com'),
      name: 'access_token',
      value: widget.accessToken,
      isHttpOnly: true,
      isSecure: true,
      sameSite: HTTPCookieSameSitePolicy.LAX,
    );
  }

  void _sendGenerationData() {
    if (_webViewController == null) return;

    final presentation = {
      'id': widget.presentationId,
      'title': 'Generated Presentation',
      'slides': [],
      'theme': widget.generationRequest['presentation']['theme'],
      'viewport': widget.generationRequest['presentation']['viewport'],
    };

    _webViewController!.evaluateJavascript(source: '''
      if (window.setGenerationData) {
        window.setGenerationData(
          ${jsonEncode(presentation)},
          ${jsonEncode(widget.generationRequest)}
        );
      }
    ''');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Generating Presentation'),
      ),
      body: Stack(
        children: [
          InAppWebView(
            initialUrlRequest: URLRequest(
              url: WebUri('https://your-domain.com/generation'),
            ),
            initialSettings: InAppWebViewSettings(
              javaScriptEnabled: true,
              thirdPartyCookiesEnabled: true,
              mixedContentMode: MixedContentMode.MIXED_CONTENT_ALWAYS_ALLOW,
            ),
            onWebViewCreated: (controller) {
              _webViewController = controller;

              // Register handlers
              controller.addJavaScriptHandler(
                handlerName: 'generationViewReady',
                callback: (args) {
                  print('Vue app ready');
                  _sendGenerationData();
                },
              );

              controller.addJavaScriptHandler(
                handlerName: 'generationStarted',
                callback: (args) {
                  final data = args[0] as Map<String, dynamic>;
                  setState(() {
                    _isLoading = false;
                  });
                  if (data['success'] != true) {
                    setState(() {
                      _error = data['error'] as String?;
                    });
                  }
                },
              );

              controller.addJavaScriptHandler(
                handlerName: 'generationCompleted',
                callback: (args) {
                  final data = args[0] as Map<String, dynamic>;
                  if (data['success'] == true) {
                    print('Generation completed: ${data['slideCount']} slides');
                    // Navigate to presentation view or show success
                  } else {
                    setState(() {
                      _error = data['error'] as String?;
                    });
                  }
                },
              );
            },
            onLoadStop: (controller, url) {
              print('Page loaded: $url');
            },
            onConsoleMessage: (controller, consoleMessage) {
              print('Console: ${consoleMessage.message}');
            },
          ),
          if (_isLoading)
            const Center(
              child: CircularProgressIndicator(),
            ),
          if (_error != null)
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error, size: 48, color: Colors.red),
                  const SizedBox(height: 16),
                  Text(
                    'Error: $_error',
                    style: const TextStyle(color: Colors.red),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Go Back'),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
```

## Error Handling

The component handles several error scenarios:

1. **Timeout**: If no data is received within 15 seconds
2. **Invalid Data**: Missing presentation ID or generation request
3. **Generation Errors**: Errors during the streaming process
4. **Network Errors**: Failed API calls

All errors are:
- Displayed in the UI
- Logged to console
- Sent back to Flutter via `generationCompleted` callback

## Debugging

### Enable Console Logging in Flutter

```dart
onConsoleMessage: (controller, consoleMessage) {
  print('[WebView Console] ${consoleMessage.message}');
},
```

### Check Cookies

```dart
final cookies = await CookieManager.instance().getCookies(
  url: WebUri('https://your-domain.com'),
);
print('Cookies: $cookies');
```

### Verify Communication

The Vue app logs all important events to the console:
- Data received from Flutter
- Generation start/completion
- Errors

## Best Practices

1. **Always set cookies before loading the WebView**
2. **Wait for `generationViewReady` before sending data**
3. **Handle all callbacks (success and error cases)**
4. **Implement proper error UI in Flutter**
5. **Test with mock data first**
6. **Use HTTPS in production**
7. **Implement proper loading states**
8. **Handle WebView lifecycle (pause/resume)**

## Troubleshooting

### Data not received
- Check if `generationViewReady` callback was triggered
- Verify the data format matches the TypeScript interfaces
- Check browser console for errors

### Authentication issues
- Verify cookies are set correctly
- Check cookie domain and path
- Ensure secure flag matches your protocol (HTTP/HTTPS)

### Generation not starting
- Verify `presentationId` is valid
- Check `generationRequest` contains all required fields
- Look for errors in the `generationStarted` callback

### Blank screen
- Check if route `/generation` is accessible
- Verify JavaScript is enabled
- Check for CORS issues in browser console
