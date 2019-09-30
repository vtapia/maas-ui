import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect, useState } from "react";

import "./SSLKeyList.scss";
import { sslkey as sslkeyActions } from "app/preferences/actions";
import { sslkey as sslkeySelectors } from "app/preferences/selectors";
import Button from "app/base/components/Button";
import Loader from "app/base/components/Loader";
import MainTable from "app/base/components/MainTable";
import Notification from "app/base/components/Notification";
import TableDeleteConfirm from "app/base/components/TableDeleteConfirm";

const generateRows = (
  sslkeys,
  expandedId,
  setExpandedId,
  hideExpanded,
  dispatch
) =>
  sslkeys.map(({ id, display }) => {
    const expanded = expandedId === id;
    return {
      className: expanded ? "p-table__row is-active" : null,
      columns: [
        {
          content: display,
          role: "rowheader"
        },
        {
          content: (
            <>
              <Button
                appearance="base"
                className="is-small u-justify-table-icon u-no-margin--right"
                onClick={() => {}}
              >
                <i className="p-icon--copy">Copy</i>
              </Button>
              <Button
                appearance="base"
                className="is-small u-justify-table-icon"
                onClick={() => {
                  setExpandedId(id);
                }}
              >
                <i className="p-icon--delete">Delete</i>
              </Button>
            </>
          ),
          className: "u-align--right u-align-icons--top"
        }
      ],
      expanded: expanded,
      expandedContent: expanded && (
        <TableDeleteConfirm
          modelName={display}
          modelType="SSL key"
          onCancel={hideExpanded}
          onConfirm={() => {}}
        />
      ),
      key: id,
      sortData: {
        key: display
      }
    };
  });

const SSLKeyList = () => {
  const [expandedId, setExpandedId] = useState();
  const sslkeyErrors = useSelector(sslkeySelectors.errors);
  const sslkeyLoading = useSelector(sslkeySelectors.loading);
  const sslkeyLoaded = useSelector(sslkeySelectors.loaded);
  const sslkeys = useSelector(sslkeySelectors.all);
  const dispatch = useDispatch();

  const hideExpanded = () => {
    setExpandedId();
  };

  useEffect(() => {
    dispatch(sslkeyActions.fetch());
  }, [dispatch]);

  return (
    <>
      {sslkeyErrors && (
        <Notification type="negative" status="Error:">
          {sslkeyErrors}
        </Notification>
      )}
      {sslkeyLoading && <Loader text="Loading..." />}
      <div className="p-table-actions">
        <div className="p-table-actions__space-left"></div>
        <Button element={Link} to="/account/prefs/ssl-keys/add">
          Add SSL key
        </Button>
      </div>
      {sslkeyLoaded && (
        <MainTable
          className="p-table-expanding--light sslkey-list"
          expanding={true}
          headers={[
            {
              content: "Key",
              sortKey: "key"
            },
            {
              content: "Actions",
              className: "u-align--right"
            }
          ]}
          paginate={20}
          rows={generateRows(
            sslkeys,
            expandedId,
            setExpandedId,
            hideExpanded,
            dispatch
          )}
          sortable={true}
        />
      )}
    </>
  );
};

export default SSLKeyList;