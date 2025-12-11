/**
 * Settings page translations
 */
export default {
  title: 'Settings',
  subtitle: 'Manage your personal preferences.',
  tabs: {
    profile: 'Profile',
    general: 'General',
    appearance: 'Appearance',
    devtools: 'DevTools',
  },
  profile: {
    title: 'Profile Picture',
    subtitle: 'Upload and manage your avatar',
    form: {
      title: 'Your Profile',
      subtitle: 'Manage and update your personal information',
      firstName: 'First Name',
      firstNamePlaceholder: 'Enter your first name',
      lastName: 'Last Name',
      lastNamePlaceholder: 'Enter your last name',
      dateOfBirth: 'Date of Birth',
      saveChanges: 'Save Changes',
      saving: 'Saving...',
      loading: 'Loading user profile...',
      uploadNewPicture: 'Upload New Picture',
      uploading: 'Uploading...',
      remove: 'Remove',
      removing: 'Removing...',
      acceptedFormats: 'Accepted formats: PNG, JPEG, GIF (Max 5MB)',
      error: {
        title: 'Error',
        loadFailed: 'Failed to load user profile: {{message}}',
      },
      validation: {
        firstNameRequired: 'First name is required',
        lastNameRequired: 'Last name is required',
      },
    },
  },
  language: {
    title: 'Language',
    subtitle: 'Select your preferred language',
  },
  devtools: {
    title: 'Development',
    subtitle: 'Development and testing configurations.',
    useMockData: 'Use mock data',
    useMockDataDescription: 'Enable mock data for development and testing',
    backendUrl: 'Backend URL',
    backendUrlPlaceholder: 'Enter backend URL',
    backendUrlDescription: 'The URL of your backend API server',
    backendUrlSaved: 'Backend URL saved successfully',
    save: 'Save',
    aiModels: {
      title: 'AI Models',
      subtitle: 'Manage available AI models and their configurations.',
      loading: 'Loading available AI models...',
      loadingModels: 'Loading models...',
      errorLoading: 'Failed to load AI models.',
      errorMessage: 'Error loading models. Please try again later.',
      emptyState: 'No models available.',
      columns: {
        model: 'Model',
        provider: 'Provider',
        mediaTypes: 'Media Types',
        modelId: 'Model ID',
        status: 'Status',
      },
      defaultModels: {
        title: 'Default Models',
        subtitle:
          'Set the default model for each media type. Only enabled models are available for selection.',
        noModelsAvailable: 'No models available',
        selectDefaultModel: 'Select default model',
        currentModel: 'Current: {{modelName}} by {{provider}}',
        noEnabledModels: 'No enabled models available. Enable at least one model to set defaults.',
      },
    },
    dangerZone: {
      title: 'Danger Zone',
      subtitle: 'Irreversible and destructive actions.',
      deleteEverything: 'Delete Everything',
      deleteEverythingMessage: "BOOM! Everything has been deleted! And it's your fault.",
    },
  },
};
