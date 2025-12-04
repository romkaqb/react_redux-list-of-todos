/* eslint-disable */
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { getTodos, getUser } from '../../api';
import { actions as todosActions } from '../../features/todos';
import { actions as currentTodoActions } from '../../features/currentTodo';
import { Todo } from '../../types/Todo';

export const TodoList: React.FC = () => {
  const { todos, error } = useAppSelector(state => state.todos);
  const { status, query }= useAppSelector(state => state.filter)
  const dispatch = useAppDispatch();

  const handleOpenModal = (todo: Todo) => {
    dispatch(currentTodoActions.setCurrentTodo(todo));
    dispatch(currentTodoActions.setModalLoading(true));
    dispatch(currentTodoActions.toggleModal(true));
    setTimeout(() => {
      dispatch(currentTodoActions.setModalLoading(false));
    }, 1000)

    getUser(todo.userId).then(user => {
      dispatch(currentTodoActions.setCurrentUser(user));
      dispatch(currentTodoActions.setModalLoading(false));
    });
  };

  useEffect(() => {
    dispatch(todosActions.setLoading(true));

    getTodos()
      .then(todosFromServer => {
        let result = todosFromServer;

        switch (status) {
          case 'active':
            result = result.filter(todo => !todo.completed);
            break;

          case 'completed':
            result = result.filter(todo => todo.completed);
            break;

          default:
            break;
        }

        if (query.trim()) {
          const normalized = query.trim().toLowerCase();
          result = result.filter(todo =>
            todo.title.toLowerCase().includes(normalized)
          );
        }

        if (result.length === 0) {
          dispatch(todosActions.setError(
            'There are no todos matching current filter criteria'
          ));
        } else {
          dispatch(todosActions.setError(null));
        }

        dispatch(todosActions.setTodos(result));
      })
      .catch(() =>
        dispatch(todosActions.setError(
          'Failed to load todos from server'
        ))
      )
      .finally(() => {
        dispatch(todosActions.setLoading(false));
      });
  }, [status, query]);

  return (
    <>
      {error && (
        <p className="notification is-warning">
          {error}
        </p>)}

      <table className="table is-narrow is-fullwidth">
        <thead>
          <tr>
            <th>#</th>

            <th>
              <span className="icon">
                <i className="fas fa-check" />
              </span>
            </th>

            <th>Title</th>
            <th> </th>
          </tr>
        </thead>

        <tbody>
          {todos.map(todo => (
            <tr data-cy="todo">
              <td className="is-vcentered">{todo.id}</td>

              <td className="is-vcentered">
                <span className="icon" data-cy="iconCompleted">
                  {todo.completed ? <i className="fas fa-check" /> : ''}

                </span>
              </td>

              <td className="is-vcentered is-expanded">
                {todo.completed ? (
                  <p className="has-text-success">
                    {todo.title}
                  </p>) : (
                    <p className="has-text-danger">
                      {todo.title}
                    </p>
                  )
                }
              </td>

              <td className="has-text-right is-vcentered">
                <button
                  data-cy="selectButton"
                  className="button"
                  type="button"
                  onClick={() => handleOpenModal(todo)}
                >
                  <span className="icon">
                    <i className="far fa-eye" />
                  </span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
