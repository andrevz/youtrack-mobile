import {ScrollView, View, Text, TextInput, TouchableOpacity, Image, AsyncStorage, ActivityIndicator} from 'react-native';
import React from 'react';

import styles from './create-issue.styles';
import issueStyles from '../single-issue/single-issue.styles';
import Header from '../../components/header/header';
import {notifyError} from '../../components/notification/notification';
import {UIImagePickerManager} from 'NativeModules';
import Router from '../../components/router/router';
import {attach, tag, next} from '../../components/icon/icon';
import CustomFieldsPanel from '../../components/custom-fields-panel/custom-fields-panel';

const PROJECT_ID_STORAGE_KEY = 'YT_DEFAULT_CREATE_PROJECT_ID_STORAGE';

export default class CreateIssue extends React.Component {
  constructor() {
    super();
    this.state = {
      processing: false,

      issue: {
        summary: null,
        description: null,
        attachments: [],
        fields: [],
        project: {
          id: null,
          shortName: 'Not selected'
        }
      }
    };

    AsyncStorage.getItem(PROJECT_ID_STORAGE_KEY)
      .then(projectId => {
        if (projectId) {
          this.state.issue.project.id = projectId;
          this.updateIssueDraft();
        }
      });
  }

  updateIssueDraft(projectOnly = false) {
    let issueToSend = this.state.issue;
    if (projectOnly) {
      issueToSend = {id: this.state.issue.id, project: this.state.issue.project};
    }

    return this.props.api.updateIssueDraft(issueToSend)
      .then(issue => {
        this.state.issue = issue;
        this.forceUpdate();
      })
      .catch(err => notifyError('Cannot create issue', err));
  }

  createIssue() {
    this.setState({processing: true});

    return this.updateIssueDraft()
      .then(() => this.props.api.createIssue(this.state.issue))
      .then(res => {
        console.info('Issue created', res);
        this.props.onCreate(res);
        Router.pop();
      })
      .catch(err => {
        this.setState({processing: false});
        return notifyError('Cannot create issue', err);
      });
  }

  attachPhoto(takeFromLibrary = true) {
    const method = takeFromLibrary ? 'launchImageLibrary' : 'launchCamera';

    UIImagePickerManager[method]({}, (res) => {
      if (res.didCancel) {
        return;
      }
      this.state.issue.attachments.push(res);
      this.forceUpdate();
    });
  }

  onUpdateProject(project) {
    this.state.issue.project = project;
    this.forceUpdate();

    AsyncStorage.setItem(PROJECT_ID_STORAGE_KEY, project.id);
    return this.updateIssueDraft(project.id);
  }

  onSetFieldValue(field, value) {
    this.state.issue.fields = this.state.issue.fields.slice().map(f => {
      if (f === field) {
        f.value = value;
      }
      return f;
    });

    this.forceUpdate();
    return this.updateIssueDraft();
  }

  _renderAttahes() {
    return this.state.issue.attachments.map(img => {
      return (
        <TouchableOpacity
          key={img.uri}
          onPress={() => Router.ShowImage({imageUrl: img.uri, imageName: img.path})}
        >
          <Image style={issueStyles.attachment}
                 source={{uri: img.uri}}/>
        </TouchableOpacity>
      );
    });
  }

  render() {
    const canCreateIssue = this.state.issue.summary && this.state.issue.project.id && !this.state.processing;

    const createButton = <Text style={canCreateIssue ? null : styles.disabledCreateButton}>Create</Text>;

    return (
      <View style={styles.container} ref="container">
        <ScrollView>
          <Header leftButton={<Text>Cancel</Text>}
                  rightButton={this.state.processing ? <ActivityIndicator style={styles.creatingIndicator}/> : createButton}
                  onRightButtonClick={() => canCreateIssue && this.createIssue()}>
            <Text>New Issue</Text>
          </Header>
          <View>
            <View>
              <TextInput
                style={styles.summaryInput}
                placeholder="Summary"
                returnKeyType="next"
                onSubmitEditing={() => this.refs.description.focus()}
                onChangeText={(summary) => {
                  this.state.issue.summary = summary;
                  this.forceUpdate();
                }}/>
            </View>
            <View style={styles.separator}/>
            <View>
              <TextInput
                ref="description"
                style={styles.descriptionInput}
                multiline={true}
                placeholder="Description"
                onChangeText={(description) => {
                  this.state.issue.description = description;
                  this.forceUpdate();
                }}/>
            </View>
            {false/*TODO: turn on when attachments could work*/ && <View style={styles.attachesContainer}>
              <View>
                {this.state.issue.attachments.length > 0 && <ScrollView style={issueStyles.attachesContainer} horizontal={true}>
                  {this._renderAttahes(this.state.issue.attachments)}
                </ScrollView>}
              </View>
              <View style={styles.attachButtonsContainer}>
                <TouchableOpacity
                  style={styles.attachButton}
                  onPress={() => this.attachPhoto(true)}>
                  <Image style={styles.attachIcon} source={attach}/>
                  <Text style={styles.attachButtonText}>Attach file from library...</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.attachButton}
                  onPress={() => this.attachPhoto(false)}>
                  <Text style={styles.attachButtonText}>Take a picture...</Text>
                </TouchableOpacity>
              </View>
            </View>}
            <View style={styles.separator}/>
            {false && <View style={styles.actionContainer}>
              <Image style={styles.actionIcon} source={tag}/>
              <View style={styles.actionContent}>
                <Text>Add tag</Text>
                <Image style={styles.arrowImage} source={next}></Image>
              </View>
            </View>}
          </View>
        </ScrollView>

        <CustomFieldsPanel
          api={this.props.api}
          issue={this.state.issue}
          containerViewGetter={() => this.refs.container}
          canEditProject={true}
          issuePermissions={{canUpdateField: () => true}}
          onUpdate={this.onSetFieldValue.bind(this)}
          onUpdateProject={this.onUpdateProject.bind(this)}/>
      </View>
    );
  }
}
